import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { gameCode } from './gameCode';

export default function App() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body { margin: 0; padding: 0; overflow: hidden; background-color: #000; color: white; height: 100vh; width: 100vw; }
          #root { width: 100%; height: 100%; }
          #loader { display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column; }
          #loader .spinner { width:40px; height:40px; border:3px solid rgba(255,255,255,0.1); border-top-color:#0af; border-radius:50%; animation:spin 0.8s linear infinite; }
          @keyframes spin { to { transform:rotate(360deg); } }
          #loader .text { margin-top:16px; font-family:monospace; font-size:12px; color:#0af; letter-spacing:3px; }
        </style>
      </head>
      <body>
        <div id="root">
          <div id="loader">
            <div class="spinner"></div>
            <div class="text">INITIALIZING...</div>
          </div>
        </div>
        <script>
          // Global error handlers for debugging
          window.onerror = function(msg, url, line, col, error) {
            document.body.innerHTML = '<div style="padding:20px;color:red;font-family:monospace">' +
              '<h2>⚠ Runtime Error</h2><pre style="white-space:pre-wrap;word-break:break-all">' +
              msg + '\\nLine: ' + line + '\\nCol: ' + col +
              '\\n\\n' + (error && error.stack ? error.stack : '') + '</pre></div>';
            return true;
          };
          window.onunhandledrejection = function(e) {
            document.body.innerHTML = '<div style="padding:20px;color:orange;font-family:monospace">' +
              '<h2>⚠ Unhandled Promise Rejection</h2><pre style="white-space:pre-wrap;word-break:break-all">' +
              (e.reason ? (e.reason.message || e.reason) : 'Unknown') + '</pre></div>';
          };
        </script>
        <script>
          try {
            ${gameCode}
          } catch (e) {
            document.body.innerHTML = '<div style="padding:20px; color:red; font-family:monospace;"><h2>⚠ JS Error</h2><pre style="white-space:pre-wrap;word-break:break-all">' + e.message + '\\n' + e.stack + '</pre></div>';
          }
        </script>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ html: html }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error:', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error:', nativeEvent.statusCode);
        }}
        onMessage={(event) => {
          console.log('WebView:', event.nativeEvent.data);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
});
