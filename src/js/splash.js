var UI = require('ui');
var Vector2 = require('vector2');
var Feature = require('platform/feature');

function createSplash(options) {
  options = options || {};

  var titleText = options.title || 'Currency Exchange';
  var subtitleText = options.subtitle || 'Multi-Currency Converter';
  var iconPath = options.iconPath || 'images/currency32.png';
  var loadingText = options.loadingText || 'Loading...';

  var COLOR_BG = Feature.color('#24B6FF', 'white');
  var COLOR_TEXT = Feature.color('black', 'black');

  var splash = new UI.Window({
    backgroundColor: COLOR_BG
  });

  var icon = new UI.Image({
    position: new Vector2(56, 32),
    size: new Vector2(32, 32),
    image: iconPath
  });
  splash.add(icon);

  var title = new UI.Text({
    position: new Vector2(0, 72),
    size: new Vector2(144, 28),
    text: titleText,
    font: 'GOTHIC_24_BOLD',
    color: COLOR_TEXT,
    textAlign: 'center'
  });
  splash.add(title);

  var subtitle = new UI.Text({
    position: new Vector2(0, 100),
    size: new Vector2(144, 24),
    text: subtitleText,
    font: 'GOTHIC_18',
    color: COLOR_TEXT,
    textAlign: 'center'
  });
  splash.add(subtitle);

  var statusText = new UI.Text({
    position: new Vector2(0, 140),
    size: new Vector2(144, 24),
    text: loadingText,
    font: 'GOTHIC_14',
    color: COLOR_TEXT,
    textAlign: 'center'
  });
  splash.add(statusText);

  var dots = 0;
  var loadingTimer = setInterval(function () {
    dots = (dots + 1) % 4;
    statusText.text(loadingText + '.'.repeat(dots));
  }, 500);

  splash.on('hide', function () {
    clearInterval(loadingTimer);
  });

  splash.setLoading = function (text) {
    if (typeof text === 'string') {
      loadingText = text;
      statusText.text(text);
    }
  };

  return splash;
}

module.exports = createSplash;
