import { Meteor } from 'meteor/meteor';
import { URL } from 'meteor/url';

OAuth._storageTokenPrefix = "Meteor.oauth.credentialSecret-";

OAuth._redirectUri = (serviceName, config, params, absoluteUrlOptions) => {
  // Clone because we're going to mutate 'params'. The 'cordova' and
  // 'android' parameters are only used for picking the host of the
  // redirect URL, and not actually included in the redirect URL itself.
  let isCordova = false;
  let isAndroid = false;
  if (params) {
    params = { ...params };
    isCordova = params.cordova;
    isAndroid = params.android;
    delete params.cordova;
    delete params.android;
    if (Object.keys(params).length === 0) {
      params = undefined;
    }
  }

  if (Meteor.isServer && isCordova) {
    let rootUrl = process.env.MOBILE_ROOT_URL ||
          __meteor_runtime_config__.ROOT_URL;

    if (isAndroid) {
      // Match the replace that we do in cordova boilerplate
      // (boilerplate-generator package).
      // XXX Maybe we should put this in a separate package or something
      // that is used here and by boilerplate-generator? Or maybe
      // `Meteor.absoluteUrl` should know how to do this?
      const parsedRootUrl = new URL(rootUrl);
      if (parsedRootUrl.hostname === "localhost") {
        parsedRootUrl.hostname = "10.0.2.2";
        delete parsedRootUrl.host;
      }
      rootUrl = parsedRootUrl.toString();
    }

    absoluteUrlOptions = {
      ...absoluteUrlOptions,
      // For Cordova clients, redirect to the special Cordova root url
      // (likely a local IP in development mode).
      rootUrl,
    };
  }

  const constructedUrl = new URL(Meteor.absoluteUrl(`_oauth/${serviceName}`, absoluteUrlOptions))
  Object.keys(params).forEach(key => {
    constructedUrl.searchParams.append(key, params[key]);
  });

  return constructedUrl.toString();
};
