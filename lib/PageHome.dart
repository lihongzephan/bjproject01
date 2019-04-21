// This program display the Home Page

// Import Flutter Darts
import 'dart:convert';
import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:speech_recognition/speech_recognition.dart';
import 'package:flutter/services.dart';
import 'package:simple_permissions/simple_permissions.dart';
import 'package:flutter_tts/flutter_tts.dart';

// Import Self Darts
import 'LangStrings.dart';
import 'ScreenVariables.dart';
import 'GlobalVariables.dart';
import 'Utilities.dart';

// Import Pages
import 'BottomBar.dart';

// Class for stt
const languages = const [
  const Language('Chinese', 'zh_CN'),
  const Language('English', 'en_US'),
  const Language('Francais', 'fr_FR'),
  const Language('Pусский', 'ru_RU'),
  const Language('Italiano', 'it_IT'),
  const Language('Español', 'es_ES'),
];

class Language {
  final String name;
  final String code;

  const Language(this.name, this.code);
}

enum TtsState { playing, stopped }

// Home Page
class ClsHome extends StatelessWidget {
  final intState;

  ClsHome(this.intState);

  final ctlServerIP = TextEditingController();

  void funHomeInputAudio() {
    //ut.showToast(listText[listText.length - 1], true);
    //gv.listText.add(gv.listText.length.toString());
    //gv.storeHome.dispatch(Actions.Increment);
    //_speechRecognitionAvailable &&
    if (!gv.sttIsListening) {
      // Start Record
      //gv.bolPressedRecord = false;
      //start();
      gv.sttStart();
    } else if (gv.sttIsListening) {
      // Cancel Record
      //gv.bolPressedRecord = true;
      //stop();
      gv.sttCancel();
    } else {
      // do nothing, it should be impossible
    }
//    if (_speechRecognitionAvailable && !_isListening) {
//      start();
//    }
//    if (_isListening) {
//      stop();
//    }
  }

  void funConnectServer() {
    gv.serverIP = ctlServerIP.text;
    gv.URI = 'http://' + gv.serverIP + ':10541';
    gv.initSocket();
  }

  Widget RecordButton() {
    var text = ls.gs('Record');
    var color = Colors.greenAccent;
    if (gv.sttIsListening) {
      text = ls.gs('Cancel');
      color = Colors.redAccent;
    } else {
      text = ls.gs('Record');
      color = Colors.greenAccent;
    }
    return RaisedButton(
      shape: new RoundedRectangleBorder(
          borderRadius: new BorderRadius.circular(sv.dblDefaultRoundRadius)),
      textColor: Colors.white,
      color: color,
      onPressed: () => funHomeInputAudio(),
      child: Text(text, style: TextStyle(fontSize: sv.dblDefaultFontSize * 1)),
    );
  }



  Widget ConnectButton() {
    var text = ls.gs('Connect');
    var color = Colors.greenAccent;
    return RaisedButton(
      shape: new RoundedRectangleBorder(
          borderRadius: new BorderRadius.circular(sv.dblDefaultRoundRadius)),
      textColor: Colors.white,
      color: color,
      onPressed: () => funConnectServer(),
      child: Text(text, style: TextStyle(fontSize: sv.dblDefaultFontSize * 1)),
    );
  }

  Widget STTBody() {
    if (gv.listText.length != 0) {
      return Text(
          gv.listText.length.toString() +
              ': ' +
              gv.listText[gv.listText.length - 1],
          style: TextStyle(fontSize: sv.dblDefaultFontSize * 1.5));
    } else {
      return Text(ls.gs('PressAndSpeak'),
          style: TextStyle(fontSize: sv.dblDefaultFontSize * 1.5));
    }
  }

  Widget Body() {
    return Container(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            height: sv.dblBodyHeight,
            width: sv.dblScreenWidth,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Container(
                  // width: sv.dblScreenWidth / 2,
                  child: Center(
                    child: STTBody(),
                  ),
                ),
                Text(' '),
                Container(
                  // height: sv.dblBodyHeight / 4,
                  // width: sv.dblScreenWidth / 4,
                  child: Center(
                    child: SizedBox(
                      height: sv.dblDefaultFontSize * 2.5,
                      width: sv.dblScreenWidth / 3,
                      child: RecordButton(),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget ConnectBody() {
    return Container(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            height: sv.dblBodyHeight,
            width: sv.dblScreenWidth,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Container(
                  width: sv.dblScreenWidth / 2,
                  child: TextField(
                    controller: ctlServerIP,
                    decoration: new InputDecoration(labelText: ls.gs('ServerIP')),
                    keyboardType: TextInputType.number,
                    onChanged: (a) => gv.serverIP = ctlServerIP.text,
                  ),
                ),
                Text(' '),
                Container(
                  // height: sv.dblBodyHeight / 4,
                  // width: sv.dblScreenWidth / 4,
                  child: Center(
                    child: SizedBox(
                      height: sv.dblDefaultFontSize * 2.5,
                      width: sv.dblScreenWidth / 3,
                      child: ConnectButton(),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

//  void funInitFirstTime() {
//    // WebRTC
//    if (gv.rtcSelfId == '') {
//      initRenderers();
//      _connect();
//    }
//  }

  @override
  Widget build(BuildContext context) {
    try {
      ctlServerIP.text = gv.serverIP;

      if (gv.bolFirstTimeLoginSuccess == true) {
        return Scaffold(
          resizeToAvoidBottomPadding: false,
          appBar: PreferredSize(
            child: AppBar(
              title: Text(
                ls.gs('Home'),
                style: TextStyle(fontSize: sv.dblDefaultFontSize),
              ),
            ),
            preferredSize: new Size.fromHeight(sv.dblTopHeight),
          ),
          body: Body(),
          bottomNavigationBar: ClsBottom(),
        );
      } else {
        return Scaffold(
          resizeToAvoidBottomPadding: false,
          appBar: PreferredSize(
            child: AppBar(
              title: Text(
                ls.gs('Home'),
                style: TextStyle(fontSize: sv.dblDefaultFontSize),
              ),
            ),
            preferredSize: new Size.fromHeight(sv.dblTopHeight),
          ),
          body: ConnectBody(),
          bottomNavigationBar: ClsBottom(),
        );
      }
    } catch (err) {
      ut.funDebug('home wigdet build error: ' + err.toString());
      return Container();
    }
  }
}
