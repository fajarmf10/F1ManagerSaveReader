import '@/styles/globals.css'
import {Container, createTheme, CssBaseline, ThemeProvider, Typography} from "@mui/material";
import {Plus_Jakarta_Sans} from 'next/font/google'
import Head from "next/head";
import {SnackbarProvider} from "notistack";
import {useContext, useEffect, useState} from "react";
import Dropzone from "react-dropzone";
import {BasicInfoHeader} from "../components/Common/subcomponents/BasicInfoHeader";
import {
  BasicInfoContext, BasicInfoUpdaterContext,
  DatabaseContext,
  DatabaseUpdaterContext,
  EnvContext,
  MetadataContext,
} from "../components/Contexts";
import DragBox from "../components/UI/Blocks/DragBox";
import {defaultFont, defaultFontFamily} from "../components/UI/Fonts";
import Footer from "../components/UI/Footer";
import Header from "../components/UI/Header";
import Nav from "../components/Nav";
import {parseBasicInfo} from "../js/basicInfoParser";
import {analyzeFileToDatabase} from "../js/fileAnalyzer";

const theme = createTheme({
  palette: {
    mode: 'dark',
    white: {
      main: '#eee',
      contrastText: '#222',
    },
  },
  typography: {
    fontFamily: defaultFontFamily,
  },
});



export function DataView({ children }) {
  const {version, gameVersion} = useContext(MetadataContext)
  const basicInfo = useContext(BasicInfoContext);

  if (!version) {
    return (
      <Typography variant="h5" component="h5" sx={{ m: 2 }}>
        Please drag a file first. All processing is done client-side so your savefile won't be uploaded.
      </Typography>
    );
  }

  if (!basicInfo) {
    return (
      <Typography variant="h5" component="h5" sx={{ m: 2 }}>
        This savefile is corrupted or unsupported.
      </Typography>
    );
  }

  return (
    <div className={`version_container game_v${version}`} ref={r => window.vc = r}>
      <BasicInfoHeader />
      <Nav />
      {children}
    </div>
  )
}


export default function App({ Component, pageProps }) {

  const [loaded, setLoaded] = useState(false);
  const [db, setDb] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [inApp, setInApp] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [basicInfo, setBasicInfo] = useState(null);

  const [updated, setUpdated] = useState(0);
  const refresh = () => setUpdated(+new Date());

  const openFile = (f) => {
    analyzeFileToDatabase(f).then(({db, metadata}) => {
      setDb(db);
      setMetadata(metadata);
      if (metadata.version) {
        try {
          setBasicInfo(parseBasicInfo({
            db, metadata
          }))
          refresh();
        } catch (e) {
          console.error(e);
          setBasicInfo(null);
        }
      } else {
        setBasicInfo(null);
      }
    });
  }

  const updateBasicInfo = () => {
    try {
      setBasicInfo(parseBasicInfo({
        db, metadata
      }))
    } catch (e) {
      console.error(e);
      setBasicInfo(null);
    }
  }


  useEffect(() => {
    if (window?.navigator?.userAgent?.includes("MRCHROME") && !inApp) {
      setInApp(true);
    }

    require('sql.js')({
      locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.9.0/${f}`
    }).then(SQL => {
      window.SQL = SQL;
      setLoaded(true);
    });

    window.document.addEventListener('loadFile', e => {
      openFile(e.detail.file);
      setFilePath(e.detail.path);
      setInApp(true);
      window.mode = "app";
      window.file_path = e.detail.path;
    }, false)
  }, []);


  return (
    <ThemeProvider theme={theme}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width"/>
        <title>F1 Manager Save Browser - F1Setup.CFD</title>
        <meta name="description" content="F1 Manager Save Browser by ieb"/>
        <link rel="icon" href="/favicon.ico"/>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <SnackbarProvider
        maxSnack={10}
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
      >
        <CssBaseline />
        {
          loaded ? (
            <DatabaseContext.Provider value={db}>
              <DatabaseUpdaterContext.Provider value={setDb}>
                <MetadataContext.Provider value={metadata}>
                  <BasicInfoContext.Provider value={basicInfo}>
                    <BasicInfoUpdaterContext.Provider value={() => updateBasicInfo()}>
                      <EnvContext.Provider value={{ inApp, filePath }}>
                        <Dropzone
                          onDropAccepted={files => openFile(files[0])}
                          noClick
                          multiple={false}
                        >
                          {({ getRootProps, getInputProps }) => (
                            <div {...getRootProps()}>
                              <Header />
                              <input {...getInputProps()} hidden />
                              <DragBox />
                              <Container maxWidth={false} component="main">
                                <DataView key={updated}>
                                  <Component {...pageProps} />
                                </DataView>
                              </Container>
                              <Footer />
                            </div>
                          )}
                        </Dropzone>
                      </EnvContext.Provider>
                    </BasicInfoUpdaterContext.Provider>
                  </BasicInfoContext.Provider>
                </MetadataContext.Provider>
              </DatabaseUpdaterContext.Provider>
            </DatabaseContext.Provider>
          ) : (
            <Container maxWidth={false} component="main">
              <Typography variant="h5" component="h5">
                Loading Database parser. Please wait.
              </Typography>
            </Container>
          )
        }
      </SnackbarProvider>
    </ThemeProvider>
  );
}
