# F1 Manager Save Browser

A tool for browsing and analyzing F1 Manager game save files. This application allows you to explore and extract information from your F1 Manager save games.

## Features

- Load and parse F1 Manager save files
- Browse save game data
- Analyze team and driver statistics
- Export data for further analysis

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:

```bash
git clone https://github.com/fajarmf10/F1ManagerSaveReader.git
cd F1ManagerSaveReader
```

2. Install dependencies:

```bash
npm install
# or if using yarn
yarn install
```

## Running the Project

### Development Mode

To run the project in development mode with hot-reload:

```bash
npm run dev
# or with yarn
yarn dev
```

The application will be available at `http://localhost:5173` by default.

### Production Build

To create a production build:

```bash
npm run build
# or with yarn
yarn build
```

To preview the production build:

```bash
npm run preview
# or with yarn
yarn preview
```

## Raising Issues on GitHub

When reporting issues, please follow these guidelines to help us understand and resolve your problem quickly:

### Issue Template

1. **Issue Title**: Use a clear and descriptive title

   - Example: "[Bug] Save file fails to load for F1 Manager 2023 v1.2"

2. **Issue Description**:

   - Describe what happened
   - Describe what you expected to happen
   - Include steps to reproduce the issue

3. **Environment Information**:

   - Operating System and version
   - Browser and version
   - F1 Manager game version
   - Save file version (if known)

4. **Additional Context**:
   - Screenshots (if applicable)
   - Error messages
   - Save file (if possible and relevant)

### Example Issue Format

```markdown
**Description**
When trying to load a save file from F1 Manager 2023, the application shows a blank screen.

**Steps to Reproduce**

1. Open the application
2. Click "Load Save File"
3. Select save file "career_save_01.sav"
4. Click "Open"

**Expected Behavior**
The save file should load and display team/driver information.

**Actual Behavior**
Screen remains blank with no error message.

**Environment**

- OS: Windows 11
- Browser: Chrome 120.0
- F1 Manager Version: 2023 v1.2
- Save File Version: 1.2.345

**Additional Context**
[Screenshot of the blank screen]
```

## Credits

GVAS Metadata parsing based on a heavily modified version of [ch1pset's UESaveTool](https://github.com/ch1pset/UESaveTool)

Since this is a fork of the original project, I will not be taking any credit for the original code, so all credits go to the original author: [Repository](https://github.com/iebb/F1ManagerSaveReader)
