
# Autopass-example  
  
Example of using [Autopass](https://github.com/holepunchto/autopass) in an Expo application using <https://github.com/holepunchto/react-native-bare>.  
  
Works with [Pearpass-example](https://github.com/holepunchto/pearpass-example/)  
  
  
## Usage  
  
Start by installing the dependencies:  
  
```sh  
npm install
```  
  
Generate a bundle  
  
```sh  
bare-pack --platform android --linked --out app/app.bundle.js backend/backend.js
```  
  
When finished, you can run the app on either iOS or Android.  
  
### iOS  
  
```sh  
npm run ios
```  
  
### Android  
  
> [!IMPORTANT]  
> You may experience problems running the app on an emulated Android device under QEMU due to https://github.com/holepunchto/libjs/issues/4. If you encounter crashes, try running the app on a real Android device instead.  
  
  
```sh  
npm run android
```  
  
## License  
  
Apache-2.0
