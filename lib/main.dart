// Import Flutter Darts
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_redux/flutter_redux.dart';
import 'package:redux/redux.dart';

// Import Self Darts
import 'GlobalVariables.dart';
import 'LangStrings.dart';
import 'ScreenVariables.dart';
import 'Utilities.dart';

// Import Pages
import 'PageHome.dart';
import 'PageSelectLanguage.dart';
import 'PageSettingsMain.dart';

// Main Program
void main() async {
  // Set Orientation to PortraitUp
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

  await sv.Init();

  await gv.Init();

  // Get Previous Selected Language from SharedPreferences, if any
  gv.gstrLang = gv.getString('strLang');
  if (gv.gstrLang != '') {
    // Set Current Language
    ls.setLang(gv.gstrLang);

    // Already has Current Language, so set first page to SettingsMain
    gv.gstrCurPage = 'SettingsMain';
    gv.gstrLastPage = 'SettingsMain';
  } else {
    // First Time Use, set Current Language to English
    ls.setLang('EN');
  }

  gv.serverIP = gv.getString('serverIP');

  // Run MainApp
  runApp(new MyApp());

  // Init socket.io
  //gv.initSocket();

  void funTimerMain() async {
    try {
//      // Do Something Every 1 second
//      if (gv.bolWantToDoSomething) {
//
//      }
//
//      if (DateTime.now().millisecondsSinceEpoch - gv.timLastTask1 > 5000) {
//        // Do Something Every 5 seconds
//
//
//        // Reset timLastTask1
//        gv.timLastTask1 = DateTime.now().millisecondsSinceEpoch;
//      }

      try {
        if (gv.bolCanWaitSTT == true && gv.bolFirstTimeLoginSuccess) {
          if (DateTime.now().millisecondsSinceEpoch - gv.intStartWaitTime > gv.intMaxWaitTime) {
            ut.funDebug('Start emit stt print');
            ut.showToast('Start emit stt print');
            gv.bolCanWaitSTT = false;
            gv.storeHome.dispatch(Actions.Increment);
            gv.socket.emit('RBPrintSTT', [gv.strID, gv.listText]);
            gv.listText = [];
            //gv.storeHome.dispatch(Actions.Increment);
          }
        }
      } catch (err) {
        ut.funDebug('Socket Emit RB Print STT Error: Emit Failed');
        ut.showToast('Socket Emit RB Print STT Error: Emit Failed');
      }

      Future.delayed(Duration(milliseconds: 1000), () async {
        funTimerMain();
      });
    } catch (err) {
      ut.funDebug('funTimerMain error: ' + err);
    }
  }

  funTimerMain();
}

// Main App
class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false, // Disable Show Debug

      home: MainBody(),
    );
  }
}

class MainBody extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // Here Return Page According to gv.gstrCurPage
    switch (gv.gstrCurPage) {
      case 'Home':
        return StoreProvider(
          store: gv.storeHome,
          child: StoreConnector<int, int>(
            builder: (BuildContext context, int intTemp) {
              return ClsHome(intTemp);
            },
            converter: (Store<int> sintTemp) {
              return sintTemp.state;
            },
          ),
        );
        break;
      case 'SelectLanguage':
        return ClsSelectLanguage();
        break;
      case 'SettingsMain':
        return StoreProvider(
          store: gv.storeSettingsMain,
          child: StoreConnector<int, int>(
            builder: (BuildContext context, int intTemp) {
              return ClsSettingsMain(intTemp);
            },
            converter: (Store<int> sintTemp) {
              return sintTemp.state;
            },
          ),
        );
        break;
    }
  }
}
