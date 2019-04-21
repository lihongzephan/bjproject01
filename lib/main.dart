// Import Flutter Darts
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_redux/flutter_redux.dart';
import 'package:redux/redux.dart';

// Import Self Darts
import 'GlobalVariables.dart';
import 'LangStrings.dart';
import 'ScreenVariables.dart';

// Import Pages
import 'PageHome.dart';
import 'PageSelectLanguage.dart';
import 'PageSettingsMain.dart';

// Main Program
void main() {
  // Set Orientation to PortraitUp
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp])
      .then((_) {
    // Init Screen Variables
    sv.Init();

    // Init Global Vars and SharedPreference
    gv.Init().then((_) {
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

      // Run MainApp
      runApp(new MyApp());

      // Init socket.io
      //gv.initSocket();
    });
  });
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
