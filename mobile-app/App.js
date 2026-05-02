import React, {useState} from 'react';
import {
  SafeAreaView,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  Platform,
  Dimensions,
  useColorScheme,
  View,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import axios from 'axios';
import Config from 'react-native-config';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import PermissionsService, {isIOS} from './Permissions';

axios.interceptors.request.use(
  async config => {
    let request = config;
    request.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    request.url = configureUrl(config.url);
    return request;
  },
  error => error,
);

export const {height, width} = Dimensions.get('window');

export const configureUrl = url => {
  let authUrl = url;
  if (url && url[url.length - 1] === '/') {
    authUrl = url.substring(0, url.length - 1);
  }
  return authUrl;
};

export const fonts = {
  Bold: {fontFamily: 'Roboto-Bold'},
  Regular: {fontFamily: 'Roboto-Regular'},
};

// "Potato___Late_blight" → "Late Blight" | "Potato___healthy" → "Healthy"
const formatClassName = name => {
  return name
    .replace(/^Potato___/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};

// Color per disease type
const getResultColor = name => {
  const lower = name.toLowerCase();
  if (lower.includes('healthy')) return '#52b788';
  if (lower.includes('late')) return '#e63946';
  if (lower.includes('early')) return '#f4a261';
  return '#ffffff';
};

const options = {
  mediaType: 'photo',
  quality: 1,
  width: 256,
  height: 256,
  includeBase64: true,
};

const App = () => {
  const [result, setResult] = useState('');
  const [label, setLabel] = useState('');
  const [image, setImage] = useState('');

  const getPredication = async params => {
    return new Promise((resolve, reject) => {
      var bodyFormData = new FormData();
      bodyFormData.append('file', params);
      const url = Config.URL;
      return axios
        .post(url, bodyFormData)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          setLabel('Failed to predict.');
          reject('err', error);
        });
    });
  };

  const manageCamera = async type => {
    try {
      if (!(await PermissionsService.hasCameraPermission())) {
        return [];
      } else {
        if (type === 'Camera') {
          openCamera();
        } else {
          openLibrary();
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const openCamera = async () => {
    launchCamera(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const uri = response?.assets[0]?.uri;
        const path = Platform.OS !== 'ios' ? uri : 'file://' + uri;
        getResult(path, response);
      }
    });
  };

  const clearOutput = () => {
    setResult('');
    setImage('');
    setLabel('');
  };

  const getResult = async (path, response) => {
    setImage(path);
    setLabel('Analysing...');
    setResult('');
    const params = {
      uri: path,
      name: response.assets[0].fileName,
      type: response.assets[0].type,
    };
    const res = await getPredication(params);
    if (res?.data?.class) {
      setLabel(res.data.class);
      setResult(res.data.confidence);
    } else {
      setLabel('Failed to predict');
    }
  };

  const openLibrary = async () => {
    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const uri = response.assets[0].uri;
        const path = Platform.OS !== 'ios' ? uri : 'file://' + uri;
        getResult(path, response);
      }
    });
  };

  const diseaseColor = label ? getResultColor(label) : '#fff';
  const displayLabel = label && label !== 'Analysing...' && label !== 'Failed to predict' && label !== 'Failed to predict.'
    ? formatClassName(label)
    : label;

  return (
    <View style={styles.outer}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1f14" />
      <ImageBackground
        blurRadius={12}
        source={{uri: 'background'}}
        style={styles.background}
      >
        {/* Dark overlay */}
        <View style={styles.overlay} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.dot} />
          <View>
            <Text style={styles.title}>LeafLens</Text>
            <Text style={styles.subtitle}>POTATO DISEASE DETECTION</Text>
          </View>
          <TouchableOpacity onPress={clearOutput} style={styles.clearStyle}>
            <Image source={{uri: 'clean'}} style={styles.clearImage} />
          </TouchableOpacity>
        </View>

        {/* Leaf image */}
        {image?.length ? (
          <Image source={{uri: image}} style={styles.imageStyle} />
        ) : null}

        {/* Result card */}
        {result && label ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultCategory}>Diagnosis</Text>
            <Text style={[styles.diseaseText, {color: diseaseColor}]}>
              {displayLabel}
            </Text>
            <View style={styles.divider} />
            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceLabel}>Confidence</Text>
              <Text style={styles.confidenceValue}>
                {(parseFloat(result)).toFixed(1) + '%'}
              </Text>
            </View>
          </View>
        ) : image ? (
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{displayLabel || label}</Text>
          </View>
        ) : (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              Scan a potato leaf to detect disease
            </Text>
            <Text style={styles.hintSub}>
              Use the buttons below to take a photo or pick from gallery
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.btn}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => manageCamera('Camera')}
            style={styles.btnStyle}>
            <Image source={{uri: 'camera'}} style={styles.imageIcon} />
            <Text style={styles.btnLabel}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => manageCamera('Photo')}
            style={styles.btnStyle}>
            <Image source={{uri: 'gallery'}} style={styles.imageIcon} />
            <Text style={styles.btnLabel}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {flex: 1, backgroundColor: '#0a1f14'},
  background: {height: height, width: width},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,20,12,0.55)',
  },
  header: {
    position: 'absolute',
    top: (isIOS && 50) || 20,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#52b788',
    marginRight: 10,
    shadowColor: '#52b788',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    ...fonts.Bold,
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 10,
    color: 'rgba(82,183,136,0.8)',
    letterSpacing: 2.5,
    marginTop: -1,
  },
  clearStyle: {marginLeft: 'auto'},
  clearImage: {height: 32, width: 32, tintColor: 'rgba(255,255,255,0.6)'},
  imageStyle: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: 24,
    position: 'absolute',
    top: height / 4.8,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(82,183,136,0.3)',
  },
  resultCard: {
    position: 'absolute',
    bottom: 130,
    alignSelf: 'center',
    width: width * 0.88,
    backgroundColor: 'rgba(8,24,15,0.82)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(82,183,136,0.2)',
  },
  resultCategory: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  diseaseText: {
    fontSize: 30,
    ...fonts.Bold,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 14,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  confidenceValue: {
    fontSize: 28,
    ...fonts.Bold,
    color: '#fff',
  },
  statusPill: {
    position: 'absolute',
    bottom: 140,
    alignSelf: 'center',
    backgroundColor: 'rgba(8,24,15,0.8)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(82,183,136,0.3)',
  },
  statusText: {
    color: '#52b788',
    fontSize: 14,
    letterSpacing: 1.5,
    ...fonts.Bold,
  },
  hintBox: {
    position: 'absolute',
    top: height / 1.65,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  hintText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 17,
    textAlign: 'center',
    ...fonts.Bold,
    marginBottom: 8,
  },
  hintSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
  },
  btn: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  btnStyle: {
    backgroundColor: 'rgba(10,31,20,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(82,183,136,0.4)',
    marginHorizontal: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 18,
    alignItems: 'center',
  },
  imageIcon: {height: 28, width: 28, tintColor: '#52b788'},
  btnLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 6,
    textTransform: 'uppercase',
  },
});

export default App;
