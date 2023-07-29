import DataView from "@/components/DataView";
import styles from '@/styles/Home.module.css'
import {Container, Divider, Typography} from "@mui/material";
import {Inter} from 'next/font/google'
import Head from 'next/head'
import {useState} from "react";
import Dropzone from 'react-dropzone'

const inter = Inter({ subsets: ['latin'] })


export default function Home() {

  const [file, setFile] = useState(undefined);

  return (
    <>
      <Head>
        <title>F1 Manager Save Viewer</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth="xl" component="main" sx={{ pt: 1, pb: 1 }}>
        <div className={styles.headerContainer}>
          <div className={styles.headerTitle} >
            <Typography variant="h3" component="h3">
              F1 Manager Save Viewer
              <span
                className={styles.wideScreenOnly}
                style={{ color: "#777", fontSize: 15, marginInline: 15, textTransform: "uppercase" }}
              >{' '}for F1® Manager 2023</span>
            </Typography>
          </div>
        </div>
        <Divider variant="fullWidth" sx={{ mt: 1 }} />
      </Container>
      <Container maxWidth="xl" component="main" sx={{ pt: 1, pb: 1 }}>
        <DataView file={file} />
      </Container>
      <Dropzone
        onDropAccepted={files => setFile(files[0])}
        noClick
        multiple={false}
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} hidden />
            <div id="dropzone"/>
          </div>
        )}
      </Dropzone>
    </>
  )
}
