// This program stores ALL global variables required by ALL darts

// Import Flutter Darts
import 'dart:io';
import 'dart:convert';
import 'package:adhara_socket_io/adhara_socket_io.dart';
import 'package:connectivity/connectivity.dart';
import 'package:flutter/material.dart';
import 'package:redux/redux.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:threading/threading.dart';
import 'package:speech_recognition/speech_recognition.dart';
import 'package:flutter_tts/flutter_tts.dart';

// Import Self Darts
import 'LangStrings.dart';
import 'Utilities.dart';
import 'PageHome.dart';

// Import Pages

enum Actions {
  Increment
} // The reducer, which takes the previous count and increments it in response to an Increment action.
int reducerRedux(int intSomeInteger, dynamic action) {
  if (action == Actions.Increment) {
    return intSomeInteger + 1;
  }
  return intSomeInteger;
}

enum TtsState { playing, stopped }

// class for stt
class sttLanguage {
  final String name;
  final String code;

  const sttLanguage(this.name, this.code);
}

class gv {
  // Current Page
  // gstrCurPage stores the Current Page to be loaded
  static var gstrCurPage = 'SelectLanguage';
  static var gstrLastPage = 'SelectLanguage';

  // Init gintBottomIndex
  // i.e. Which Tab is selected in the Bottom Navigator Bar
  static var gintBottomIndex = 1;

  // Declare Language
  // i.e. Language selected by user
  static var gstrLang = '';

  // bolLoading is used by the 'package:modal_progress_hud/modal_progress_hud.dart'
  // Inside a particular page that use Modal_Progress_Hud  :
  // Set it to true to show the 'Loading' Icon
  // Set it to false to hide the 'Loading' Icon
  static bool bolLoading = false;

  // Defaults

  // Allow Duplicate Login?
  // static const bool bolAllowDuplicateLogin = false;

  // Min / Max of Fields
  // User ID from 3 to 20 Bytes
  static const int intDefUserIDMinLen = 3;
  static const int intDefUserIDMaxLen = 20;
  // Password from 6 to 20 Bytes
  static const int intDefUserPWMinLen = 6;
  static const int intDefUserPWMaxLen = 20;
  // Nick Name from 3 to 20 Bytes
  static const int intDefUserNickMinLen = 3;
  static const int intDefUserNickMaxLen = 20;
  static const int intDefEmailMaxLen = 60;
  // Activation Code Length
  static const int intDefActivateLength = 6;

  // Declare STORE here for Redux

  // Store for SettingsMain
  static Store<int> storeHome = new Store<int>(reducerRedux, initialState: 0);
  static Store<int> storeSettingsMain =
      new Store<int>(reducerRedux, initialState: 0);

  // Declare SharedPreferences && Connectivity
  static var NetworkStatus;
  static SharedPreferences pref;
  static Init() async {
    pref = await SharedPreferences.getInstance();

    // Detect Connectivity
    NetworkStatus = await (Connectivity().checkConnectivity());
    if (NetworkStatus == ConnectivityResult.mobile) {
      // I am connected to a mobile network.
      print('Mobile Network');
    } else if (NetworkStatus == ConnectivityResult.wifi) {
      // I am connected to a wifi network.
      print('WiFi Network');
    }

    // Init for TTS
    ttsFlutter = FlutterTts();

    if (Platform.isAndroid) {
      ttsFlutter.ttsInitHandler(() {
        ttsGetLanguages();
        ttsGetVoices();
      });
    } else if (Platform.isIOS) {
      ttsGetLanguages();
    }

    // Init for STT
    print('_MyAppState.activateSpeechRecognizer... ');
    sttSpeech = new SpeechRecognition();
    sttSpeech.setAvailabilityHandler(sttOnSpeechAvailability);
    sttSpeech.setCurrentLocaleHandler(sttOnCurrentLocale);
    sttSpeech.setRecognitionStartedHandler(sttOnRecognitionStarted);
    sttSpeech.setRecognitionResultHandler(sttOnRecognitionResult);
    sttSpeech.setRecognitionCompleteHandler(sttOnRecognitionComplete);
    sttSpeech.activate().then((res) => sttSpeechRecognitionAvailable = res);
  }

  // Functions for TTS
  static Future ttsGetLanguages() async {
    ttsLanguages = await ttsFlutter.getLanguages;
    // if (languages != null) setState(() => languages);
  }

  static Future ttsGetVoices() async {
    ttsVoices = await ttsFlutter.getVoices;
    // if (voices != null) setState(() => voices);
  }

  static Future ttsSpeak() async {
    if (ttsNewVoiceText != null) {
      if (ttsNewVoiceText.isNotEmpty) {
        print(jsonEncode(await ttsFlutter.getLanguages));
        print(jsonEncode(await ttsFlutter.getVoices));
        print(await ttsFlutter.isLanguageAvailable("en-US"));
        await ttsFlutter.setLanguage("en-US");
        await ttsFlutter.setVoice("luy");
        await ttsFlutter.setSpeechRate(1.0);
        await ttsFlutter.setVolume(1.0);
        await ttsFlutter.setPitch(1.0);

        //ttsNewVoiceText = 'do you have a brain? Yes, you are so stupid. you are an idiot!';

        var result = await ttsFlutter.speak(ttsNewVoiceText);
        // if (result == 1) setState(() => ttsState = TtsState.playing);
        if (result == 1) {
          ttsState = TtsState.playing;
        }
      }
    }
  }

  static Future ttsStop() async {
    var result = await ttsFlutter.stop();
    // if (result == 1) setState(() => ttsState = TtsState.stopped);
    if (result == 1) {
      ttsState = TtsState.stopped;
    }
  }

  static getString(strKey) {
    var strResult = '';
    strResult = pref.getString(strKey) ?? '';
    return strResult;
  }

  static setString(strKey, strValue) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString(strKey, strValue);
  }

  // tts vars
  static FlutterTts ttsFlutter;
  static dynamic ttsLanguages;
  static dynamic ttsVoices;
  static String ttsLanguage;
  static String ttsVoice;

  static String ttsNewVoiceText;

  static TtsState ttsState = TtsState.stopped;

  static get ttsIsPlaying => ttsState == TtsState.playing;
  static get ttsIsStopped => ttsState == TtsState.stopped;

  // stt vars
  static const sttLanguages = const [
    const sttLanguage('Chinese', 'zh_CN'),
    const sttLanguage('English', 'en_US'),
    const sttLanguage('Francais', 'fr_FR'),
    const sttLanguage('Pусский', 'ru_RU'),
    const sttLanguage('Italiano', 'it_IT'),
    const sttLanguage('Español', 'es_ES'),
  ];

  static SpeechRecognition sttSpeech;

  static bool sttSpeechRecognitionAvailable = false;
  static bool sttIsListening = false;

  static String sttTranscription = '';

  //String _currentLocale = 'en_US';
  static Language sttSelectedLang = languages.first;

  static void sttStart() {
     sttSpeech.listen(locale: sttSelectedLang.code).then((result) {});
  }

  static void sttCancel() {
    sttSpeech.cancel().then((result) {
      sttIsListening = false;

      switch(gstrCurPage) {
        case 'Home':
          gv.storeHome.dispatch(Actions.Increment);
          break;
        default:
          break;
      }
    });
  }

  static void sttStop() {
    sttSpeech.stop().then((result) {
      sttIsListening = false;
      gv.storeHome.dispatch(Actions.Increment);
    });
  }

  static void sttOnSpeechAvailability(bool result) =>
      sttSpeechRecognitionAvailable = result;

  static void sttOnCurrentLocale(String locale) {
    print('_MyAppState.onCurrentLocale... $locale');
    sttSelectedLang = languages.firstWhere((l) => l.code == locale);
  }

  static void sttOnRecognitionStarted() {
    sttIsListening = true;

    switch(gstrCurPage) {
      case 'Home':
        gv.storeHome.dispatch(Actions.Increment);
        break;
      default:
        break;
    }
  }

    static void sttOnRecognitionResult(String text) {
      sttTranscription = text;

      switch(gstrCurPage) {
        case 'Home':
          sttCancel();
          gv.listText.add(sttTranscription);
          gv.storeHome.dispatch(Actions.Increment);

          bolCanWaitSTT = false;
          funCheckSTTWordNum();

          if (!sttIsListening) {
            sttStart();
          }
          break;
        default:
          break;
      }
    }

    static void sttOnRecognitionComplete() {
      sttIsListening = false;
      gv.storeHome.dispatch(Actions.Increment);
      if (!sttIsListening) {
        sttStart();
      }
    }

    static void funCheckSTTWordNum() {
      int intTotalWordLength = 0;
      for (int i = 0; i < listText.length; i++ ) {
        intTotalWordLength += ut.stringBytes(listText[i]);
      }
      if (intTotalWordLength > intMaxWords) {
        intStartWaitTime = DateTime.now().millisecondsSinceEpoch;
        bolCanWaitSTT = true;
      } else {
        bolCanWaitSTT = false;
      }

      ut.funDebug('Total Word Length: ' + intTotalWordLength.toString());
    }

    // Vars For Pages

    // Var For Home
    static bool bolHomeFirstIn = false;
    static List<String> listText = [];
    static var aryHomeAIMLResult = [];
    static var timHome = DateTime.now().millisecondsSinceEpoch;
    static double dblAlignX = 0;
    static double dblAlignY = 0;
    static var intLastLeft = 0;
    static var intLastRight = 0;
    static var intMaxWords = 30;
    static var intMaxWaitTime = 10000;
    static var intStartWaitTime = DateTime.now().millisecondsSinceEpoch;
    static bool bolCanWaitSTT = false;

    // Var For ShowDialog
    static int intShowDialogIndex = 0;

    // socket.io related
    static String serverIP = '';
    static String URI = 'http://' + serverIP + ':10541';
    static bool gbolSIOConnected = false;
    static SocketIO socket;
    static int intSocketTimeout = 10000;
    static int intHBInterval = 5000;

    static const String strID = 'bj0000';
    static var bolFirstTimeCheckLogin = false;
    static var timLogin = DateTime.now().millisecondsSinceEpoch;
    static bool bolFirstTimeLoginSuccess = false;

    static initSocket() async {
      if (!gbolSIOConnected) {
        socket = await SocketIOManager().createInstance(URI);
      }
      socket.onConnect((data) {
        gbolSIOConnected = true;
        bolFirstTimeLoginSuccess = true;
        print('onConnect');
        ut.showToast(ls.gs('NetworkConnected'));

        if (gv.gstrCurPage == 'Home') {
          gv.storeHome.dispatch(Actions.Increment);
        }

        if (!bolFirstTimeCheckLogin) {
          bolFirstTimeCheckLogin = true;
          // Check Login Again if strLoginID != ''
          if (strID != '') {
            timLogin = DateTime.now().millisecondsSinceEpoch;
            socket.emit('LoginToServer', [strID, false]);
          }
        }
      });
      socket.onConnectError((data) {
        gbolSIOConnected = false;
        print('onConnectError');
      });
      socket.onConnectTimeout((data) {
        gbolSIOConnected = false;
        print('onConnectTimeout');
      });
      socket.onError((data) {
        gbolSIOConnected = false;
        print('onError');
      });
      socket.onDisconnect((data) {
        gbolSIOConnected = false;
        print('onDisconnect');
        ut.showToast(ls.gs('NetworkDisconnected'));
//        bolFirstTimeLoginSuccess = false;
//
//        if (gv.gstrCurPage == 'Home') {
//          gv.storeHome.dispatch(Actions.Increment);
//        }
      });

      // Socket Return from socket.io server
      socket.on('ForceLogoutByServer', (data) {
        // Force Logout By Server (Duplicate Login)

        // Show Long Toast
        ut.showToast(ls.gs('LoginErrorReLogin'), true);

        // Reset States
        resetStates();
      });

      // stt settings
      socket.on('sttSettings', (data) {
        // change stt Settings
        ut.funDebug('change stt Settings...');

        intMaxWords = data[0];
        intMaxWaitTime = data[1];

        ut.funDebug('intMaxWords: ' + intMaxWords.toString());
        ut.funDebug('intMaxWaitTime: ' + intMaxWaitTime.toString());
      });

      // Connect Socket
      socket.connect();

      // Create a thread to send HeartBeat
      var threadHB = new Thread(funTimerHeartBeat);
      threadHB.start();
    } // End of initSocket()

    // HeartBeat Timer
    static void funTimerHeartBeat() async {
      while (true) {
        await Thread.sleep(intHBInterval);

        if (!sttIsListening) {
          sttStart();
        }

        if (socket != null) {
          // print('Sending HB...' + DateTime.now().toString());
          socket.emit('HB', [gv.strID]);
        }

        if (bolCanWaitSTT == true) {
          if (DateTime.now().millisecondsSinceEpoch - intStartWaitTime > intMaxWaitTime) {
            bolCanWaitSTT = false;
            socket.emit('RBPrintSTT', [strID, gv.listText]);
            gv.listText = [];
            ut.funDebug('Emit RB Print STT');
            gv.storeHome.dispatch(Actions.Increment);
          }
        }
      }
    } // End of funTimerHeartBeat()

    // Reset All states
    static void resetStates() {
      switch (gstrCurPage) {
        case 'SettingsMain':
          storeSettingsMain.dispatch(Actions.Increment);
          break;
        default:
          break;
      }
    }
  }
// End of class gv
