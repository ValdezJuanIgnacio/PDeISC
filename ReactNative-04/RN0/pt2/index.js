/**
 * @format
 */
import { AppRegistry } from 'react-native';
import App from './App';
import appJson from './app.json';
const appName = appJson.name;


// Registro del componente principal
AppRegistry.registerComponent(appName, () => App);

// 👇 Esta parte es necesaria para la web
if (typeof document !== 'undefined') {
  AppRegistry.runApplication(appName, {
    rootTag: document.getElementById('root'),
  });
}
