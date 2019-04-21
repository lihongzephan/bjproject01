// This program display the Settings Main Page

// Import Flutter Darts
import 'package:flutter/material.dart';
import 'package:redux/redux.dart';
import 'package:flutter_redux/flutter_redux.dart';

// Import Self Darts
import 'GlobalVariables.dart';
import 'LangStrings.dart';
import 'ScreenVariables.dart';
import 'ShowDialog.dart';
import 'Utilities.dart';

// Import Pages
import 'BottomBar.dart';
import 'PageSelectLanguage.dart';


// Home Page
class ClsSettingsMain extends StatelessWidget {
  final intState;

  ClsSettingsMain(this.intState);

  // Vars for SettingsMain
  static var listSettingsMain = [
    // list of Buttons in this page
    {'Prog': 'SelectLanguage'},
  ];

  // Choose which page when button pressed
  void funSettingsMain(strProg, context) {
    if (strProg != 'Logout') {
      // Set LastPage
      gv.gstrLastPage = gv.gstrCurPage;

      // Go to Next Page
      gv.gstrCurPage = strProg;

      // Code to Goto Next Page
      switch (strProg) {
        case 'SelectLanguage':
          Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (BuildContext context) => ClsSelectLanguage()),
                (_) => false,
          );
          break;
        default:
          break;
      }
    } else {
      sd.showAlert(context, ls.gs('Logout'),ls.gs( 'AreYouSure')+'?','Logout');
    }
  }


  @override
  Widget build(BuildContext context) {
    // Set listSettingsMain according to gv.strLogin
    listSettingsMain = [
      // list of Buttons in this page
      {'Prog': 'SelectLanguage'},
    ];
    return Scaffold(
      appBar: PreferredSize(
        child: AppBar(
          title: Text(
            ls.gs('Settings'),
            style: TextStyle(fontSize: sv.dblDefaultFontSize),
          ),
        ),
        preferredSize: new Size.fromHeight(sv.dblTopHeight),
      ),
      body: Container(
        height: sv.dblBodyHeight,
        width: sv.dblScreenWidth,
        child: Center(
          child: ListView.builder(
              shrinkWrap: true,
              itemCount: listSettingsMain.length,
              itemBuilder: (context, index) {
                return Column(
                  children: <Widget>[
                    Text(' '),
                    Row(children: <Widget>[
                      Text('                         ',
                          textAlign: TextAlign.center),
                      Expanded(
                        child: SizedBox(
                          height: sv.dblDefaultFontSize * 2.5,
                          child: RaisedButton(
                            shape: new RoundedRectangleBorder(
                                borderRadius: new BorderRadius.circular(
                                    sv.dblDefaultRoundRadius)),
                            textColor: Colors.white,
                            color: Colors.greenAccent,
                            onPressed: () => funSettingsMain(
                                listSettingsMain[index]['Prog'], context),
                            child: Text(
                                '${ls.gs(listSettingsMain[index]['Prog'])}',
                                style: TextStyle(
                                    fontSize:
                                        sv.dblDefaultFontSize * 1)),
                          ),
                        ),
                      ),
                      Text('                         ',
                          textAlign: TextAlign.center),
                    ]),
                    Text(' '),
                  ],
                );
              }),
        ),
      ),
      bottomNavigationBar: ClsBottom(),
    );
  }
}
