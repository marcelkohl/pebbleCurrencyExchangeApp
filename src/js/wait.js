var UI = require('ui');
var Vector2 = require('vector2');
var Feature = require('platform/feature');

/**
 * Cria uma janela de “aguarde” com barra de progresso animada.
 * @param {number} durationMs - Duração total em ms (ex.: 4000)
 * @param {string} [message='Updating list...'] - Mensagem exibida acima da barra
 * @returns {UI.Window} Janela Pebble.js com métodos:
 *          .show(), .stop(), .setMessage(msg)
 */
function wait(durationMs, message) {
  var DURATION = Math.max(200, durationMs | 0);
  var MSG = message || 'Updating list...';

  // 🎨 Paleta de cores pastel
  var COLOR_BG = Feature.color('#24B6FF', 'white');   // azul bem claro
  var COLOR_BAR_BG = Feature.color('#9CC7FF', 'lightgray');
  var COLOR_BAR_FILL = Feature.color('#0024AA', 'black'); // azul médio
  var COLOR_TEXT = Feature.color('black', 'black');
  var COLOR_DONE = Feature.color('#499255', 'black'); // verde suave

  // ---- Estrutura da UI ----
  var win = new UI.Window({
    backgroundColor: COLOR_BG
  });

  var text = new UI.Text({
    position: new Vector2(0, 60),
    size: new Vector2(144, 30),
    text: MSG,
    font: 'GOTHIC_24_BOLD',
    color: COLOR_TEXT,
    textAlign: 'center'
  });
  win.add(text);

  var BAR_W = 104, BAR_H = 10, BAR_X = 20, BAR_Y = 100;

  var barBg = new UI.Rect({
    position: new Vector2(BAR_X, BAR_Y),
    size: new Vector2(BAR_W, BAR_H),
    backgroundColor: COLOR_BAR_BG,
    borderColor: 'black'
  });
  win.add(barBg);

  var barFill = new UI.Rect({
    position: new Vector2(BAR_X, BAR_Y),
    size: new Vector2(0, BAR_H),
    backgroundColor: COLOR_BAR_FILL
  });
  win.add(barFill);

  // ---- Controle interno ----
  var intervalId = null;
  var running = false;
  var current = 0;
  var steps = 100;
  var stepMs = DURATION / steps;

  function resetVisuals() {
    text.text(MSG);
    barFill.size(new Vector2(0, BAR_H));
    barFill.backgroundColor(COLOR_BAR_FILL);
    current = 0;
  }

  function clearTimer() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    running = false;
  }

  function startProgress() {
    if (running) return;
    running = true;

    intervalId = setInterval(function () {
      current++;
      var w = Math.round((BAR_W * current) / steps);
      barFill.size(new Vector2(w, BAR_H));

      if (current >= steps) {
        finish();
      }
    }, stepMs);
  }

  /**
   * Anima o preenchimento final e fecha a janela com suavidade.
   */
  function finish(animated) {
    clearTimer();

    function completeAndClose() {
      text.text('Done!');
      barFill.size(new Vector2(BAR_W, BAR_H));
      barFill.backgroundColor(COLOR_DONE);

      // fecha após ~0.25 s
      setTimeout(function () {
        try {
          win.hide();
          win.remove();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }, 250);
    }

    if (animated) {
      // Animação até o fim (~0.5 s)
      var remaining = BAR_W - (BAR_W * current) / steps;
      var stepsLeft = 10;
      var increment = remaining / stepsLeft;
      var i = 0;

      var fillAnim = setInterval(function () {
        i++;
        current += steps / 10; // atualiza o valor interno
        var w = Math.min(BAR_W, barFill.size().x + increment);
        barFill.size(new Vector2(w, BAR_H));

        if (i >= stepsLeft) {
          clearInterval(fillAnim);
          completeAndClose();
        }
      }, 50);
    } else {
      completeAndClose();
    }
  }

  // ---- Eventos e API pública ----
  win.on('show', function () {
    clearTimer();
    resetVisuals();
    startProgress();
  });

  win.on('hide', function () {
    clearTimer();
  });

  // Para manualmente com animação
  win.stop = function () {
    finish(true); // anima até o fim
  };

  // Atualiza a mensagem dinamicamente
  win.setMessage = function (msg) {
    if (typeof msg === 'string' && msg.length) {
      text.text(msg);
    }
  };

  return win;
}

module.exports = wait;
