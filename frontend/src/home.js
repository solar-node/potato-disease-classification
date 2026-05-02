import { useState, useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Paper, CardActionArea, CardMedia, Grid, TableContainer, Table, TableBody, TableHead, TableRow, TableCell, Button, CircularProgress } from "@material-ui/core";
import image from "./bg.png";
import { DropzoneArea } from 'material-ui-dropzone';
import Clear from '@material-ui/icons/Clear';
import axios from "axios";

// Format "Potato___Late_blight" → "Late Blight", "Potato___healthy" → "Healthy"
const formatClassName = (name) => {
  return name
    .replace(/^Potato___/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Color coding per disease
const getResultColor = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('healthy')) return '#52b788';
  if (lower.includes('late')) return '#e63946';
  if (lower.includes('early')) return '#f4a261';
  return '#ffffff';
};

const ColorButton = withStyles(() => ({
  root: {
    color: '#fff',
    background: 'linear-gradient(135deg, #1a472a 0%, #2d6a4f 100%)',
    '&:hover': {
      background: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)',
    },
    borderRadius: '50px',
    boxShadow: '0 4px 20px rgba(45, 106, 79, 0.4)',
    transition: 'all 0.3s ease',
  },
}))(Button);

const useStyles = makeStyles((theme) => ({
  grow: { flexGrow: 1 },
  clearButton: {
    width: "-webkit-fill-available",
    borderRadius: "50px",
    padding: "15px 22px",
    color: "#fff",
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: '1px',
  },
  root: { maxWidth: 345, flexGrow: 1 },
  media: { height: 400 },
  paper: { padding: theme.spacing(2), margin: 'auto', maxWidth: 500 },
  gridContainer: {
    justifyContent: "center",
    padding: "4em 1em 0 1em",
  },
  mainContainer: {
    backgroundImage: `url(${image})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    height: "93vh",
    marginTop: "8px",
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(160deg, rgba(8,24,15,0.65) 0%, rgba(10,31,20,0.5) 100%)',
    pointerEvents: 'none',
  },
  imageCard: {
    margin: "auto",
    maxWidth: 400,
    height: 500,
    background: 'rgba(8, 24, 15, 0.72)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: '0px 8px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(82,183,136,0.15) !important',
    borderRadius: '20px',
    border: '1px solid rgba(82,183,136,0.2)',
  },
  imageCardEmpty: { height: 'auto' },
  noImage: { margin: "auto", width: 400, height: "400 !important" },
  input: { display: 'none' },
  tableContainer: {
    backgroundColor: 'transparent !important',
    boxShadow: 'none !important',
  },
  table: { backgroundColor: 'transparent !important' },
  tableHead: { backgroundColor: 'transparent !important' },
  tableRow: { backgroundColor: 'transparent !important' },
  tableCell: {
    fontSize: '22px',
    backgroundColor: 'transparent !important',
    borderColor: 'rgba(255,255,255,0.08) !important',
    color: 'rgba(255,255,255,0.55) !important',
    fontWeight: 600,
    padding: '6px 16px',
    fontFamily: "'Inter', sans-serif",
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    fontSize: '11px',
  },
  tableCellResult: {
    fontSize: '26px',
    backgroundColor: 'transparent !important',
    borderColor: 'transparent !important',
    fontWeight: 900,
    padding: '4px 16px',
    fontFamily: "'Inter', sans-serif",
  },
  tableBody: { backgroundColor: 'transparent !important' },
  text: { color: 'white !important', textAlign: 'center' },
  buttonGrid: { maxWidth: "416px", width: "100%" },
  detail: {
    backgroundColor: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 16px',
  },
  appbar: {
    background: 'linear-gradient(135deg, #0a1f14 0%, #132d1c 50%, #1a3d28 100%)',
    boxShadow: '0 2px 24px rgba(0,0,0,0.4)',
    color: 'white',
    borderBottom: '1px solid rgba(82,183,136,0.2)',
  },
  appTitle: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: '18px',
    letterSpacing: '0.5px',
    color: '#fff',
    padding: '8px 0 0 0'
  },
  appSubtitle: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'rgba(82,183,136,0.8)',
    marginTop: '-2px',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#000000',
    marginRight: 10,
    display: 'inline-block',
    boxShadow: '0 0 8px #05100a',
  },
  loader: { color: '#52b788 !important' },
  loaderText: {
    color: 'rgba(255,255,255,0.6) !important',
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    marginTop: 8,
    letterSpacing: '1px',
  },
}));

export const ImageUpload = () => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [data, setData] = useState();
  const [image, setImage] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  let confidence = 0;

  const sendFile = async () => {
    if (image) {
      let formData = new FormData();
      formData.append("file", selectedFile);
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_API_URL,
        data: formData,
      });
      if (res.status === 200) {
        setData(res.data);
      }
      setIsloading(false);
    }
  };

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  useEffect(() => {
    if (!selectedFile) { setPreview(undefined); return; }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!preview) return;
    setIsloading(true);
    sendFile();
  }, [preview]);

  const onSelectFile = (files) => {
    if (!files || files.length === 0) {
      setSelectedFile(undefined);
      setImage(false);
      setData(undefined);
      return;
    }
    setSelectedFile(files[0]);
    setData(undefined);
    setImage(true);
  };

  if (data) {
    confidence = (parseFloat(data.confidence)).toFixed(2);
  }

  const displayClass = data ? formatClassName(data.class) : '';
  const resultColor = data ? getResultColor(data.class) : '#fff';

  return (
    <React.Fragment>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <span className={classes.dot}></span>
          <div>
            <Typography className={classes.appTitle} noWrap>
              LeafLens AI
            </Typography>
            <Typography className={classes.appSubtitle} noWrap>
              Potato Plant Analysis
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} className={classes.mainContainer} disableGutters={true}>
        <div className={classes.overlay} />
        <Grid
          className={classes.gridContainer}
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={12}>
            <Card className={`${classes.imageCard} ${!image ? classes.imageCardEmpty : ''}`}>
              {image && <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image={preview}
                  component="image"
                  title="Uploaded leaf"
                />
              </CardActionArea>}
              {!image && <CardContent className={classes.content}>
                <DropzoneArea
                  acceptedFiles={['image/*']}
                  dropzoneText={"Drop a potato leaf image here, or click to browse"}
                  onChange={onSelectFile}
                />
              </CardContent>}
              {data && <CardContent className={classes.detail}>
                <TableContainer component={Paper} className={classes.tableContainer}>
                  <Table className={classes.table} size="small" aria-label="result table">
                    <TableHead className={classes.tableHead}>
                      <TableRow className={classes.tableRow}>
                        <TableCell className={classes.tableCell}>Diagnosis</TableCell>
                        <TableCell align="right" className={classes.tableCell}>Confidence</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className={classes.tableBody}>
                      <TableRow className={classes.tableRow}>
                        <TableCell component="th" scope="row" className={classes.tableCellResult}
                          style={{ color: resultColor }}>
                          {displayClass}
                        </TableCell>
                        <TableCell align="right" className={classes.tableCellResult}
                          style={{ color: 'rgba(255,255,255,0.9)' }}>
                          {confidence}%
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>}
              {isLoading && <CardContent className={classes.detail}>
                <CircularProgress className={classes.loader} size={36} />
                <Typography className={classes.loaderText} noWrap>
                  ANALYSING LEAF...
                </Typography>
              </CardContent>}
            </Card>
          </Grid>
          {data &&
            <Grid item className={classes.buttonGrid}>
              <ColorButton variant="contained" className={classes.clearButton} color="primary"
                component="span" size="large" onClick={clearData} startIcon={<Clear fontSize="large" />}>
                Clear
              </ColorButton>
            </Grid>}
        </Grid>
      </Container>
    </React.Fragment>
  );
};
