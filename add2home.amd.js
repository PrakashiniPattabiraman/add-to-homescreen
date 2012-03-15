/*!
 * Add to Homescreen v2.0 ~ Copyright (c) 2012 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */
 define(
  'add2home',
  [],
  function () {

    var add2home = {

      isIDevice: 'platform' in window.navigator && (/iphone|ipod|ipad/gi).test(window.navigator.platform),

      overrideChecks: true,

      options: {
        startDelay: 1000,     // 0ms from page load before the balloon appears
        lifespan: 30000,      // 30 seconds before it is automatically destroyed
        bottomOffset: 14,     // Distance of the balloon from bottom
        message: 'Install "%web_app_title" on your %device: tap %icon and then <strong>Add to Home Screen</strong>.',       // Customize your message or force a language ('' = automatic)
        touchIcon: true,      // Display the touch icon
      },

      init: function init () {
        // Preliminary check, prevents all further checks to be performed on iDevices only
        if ( !this.overrideChecks && !this.isIDevice ) return;

        this.isIPad = (/ipad/gi).test(window.navigator.platform);
        this.isRetina = window.devicePixelRatio && window.devicePixelRatio > 1;
        this.isSafari = window.navigator.appVersion.match(/Safari/gi);
        this.isStandalone = window.navigator.standalone;
        
        this.OSVersion = window.navigator.appVersion.match(/OS (\d+_\d+)/i);
        this.OSVersion = ( this.OSVersion && this.OSVersion[1] ) ? +this.OSVersion[1].replace('_', '.') : 5;

        window.addEventListener('load', loaded, false);
      },

      loaded: function loaded () {
        window.removeEventListener('load', loaded, false);

        if ( !this.overrideChecks && ( !this.isSafari || isStandalone ) ) return;

        var icons = options.touchIcon ? document.querySelectorAll('head link[rel=apple-touch-icon],head link[rel=apple-touch-icon-precomposed]') : [],
          sizes,
          touchIcon = '',
          closeButton,
          platform = window.navigator.platform.split(' ')[0],
          language = window.navigator.language.replace('-', '_'),
          i, l;

        this.balloon = document.createElement('div');
        this.balloon.id = 'addToHomeScreen';
        this.balloon.style.cssText += 'left:-9999px;-webkit-transition-property:-webkit-transform,opacity;-webkit-transition-duration:0;-webkit-transform:translate3d(0,0,0);position:' + (this.OSVersion < 5 ? 'absolute' : 'fixed');

        // Search for the apple-touch-icon
        if ( icons.length ) {
          for ( i = 0, l = icons.length; i < l; i++ ) {
            sizes = icons[i].getAttribute('sizes');

            if ( sizes ) {
              if ( this.isRetina && sizes == '114x114' ) {
                touchIcon = icons[i].href;
                break;
              }
            } else {
              touchIcon = icons[i].href;
            }
          }

          touchIcon = '<span style="background-image:url(' + touchIcon + ')" class="addToHomeTouchIcon"></span>';
        }

        this.balloon.className = (this.isIPad ? 'addToHomeIpad' : 'addToHomeIphone') + (touchIcon ? ' addToHomeWide' : '');
        this.balloon.innerHTML = touchIcon +
          options.message
            .replace('%web_app_title', document.title)
            .replace('%device', platform)
            .replace('%icon', this.OSVersion >= 4.2 ? '<span class="addToHomeShare"></span>' : '<span class="addToHomePlus">+</span>') +
          '<span class="addToHomeArrow"></span>' +
          '<span class="addToHomeClose">\u00D7</span>';

        document.body.appendChild(this.balloon);

        // Add the close action
        closeButton = this.balloon.querySelector('.addToHomeClose');
        if ( closeButton ) closeButton.addEventListener('touchstart', close, false);

        // setTimeout(show, options.startDelay);
      },

      show: function show () {
        var duration,
          iPadXShift = 160;

        // Set the initial position
        if ( this.isIPad ) {
          if ( this.OSVersion < 5 ) {
            this.startY = window.scrollY;
            this.startX = window.scrollX;
            iPadXShift = 208;
          }

          this.balloon.style.top = this.startY + options.bottomOffset + 'px';
          this.balloon.style.left = this.startX + iPadXShift - Math.round(this.balloon.offsetWidth / 2) + 'px';

          duration = '0.6s';
          this.balloon.style.webkitTransform = 'translate3d(0,' + -(w.scrollY + options.bottomOffset + this.balloon.offsetHeight) + 'px,0)';

        } else {
          this.startY = window.innerHeight + window.scrollY;

          if ( this.OSVersion < 5 ) {
            this.startX = Math.round((w.innerWidth - this.balloon.offsetWidth) / 2) + window.scrollX;
            this.balloon.style.left = this.startX + 'px';
            this.balloon.style.top = this.startY - this.balloon.offsetHeight - options.bottomOffset + 'px';
          } else {
            this.balloon.style.left = '50%';
            this.balloon.style.marginLeft = -Math.round(this.balloon.offsetWidth / 2) + 'px';
            this.balloon.style.bottom = options.bottomOffset + 'px';
          }

          duration = '1s';
          this.balloon.style.webkitTransform = 'translate3d(0,' + -(this.startY + options.bottomOffset) + 'px,0)';
        }

        this.balloon.offsetHeight; // repaint trick
        this.balloon.style.webkitTransitionDuration = duration;
        this.balloon.style.opacity = '1';
        this.balloon.style.webkitTransform = 'translate3d(0,0,0)';
        this.balloon.addEventListener('webkitTransitionEnd', transitionEnd, false);

        this.closeTimeout = setTimeout(close, options.lifespan);
      },

      close: function close () {
        clearTimeout( this.closeTimeout );
        this.closeTimeout = null;

        var posY = 0,
          posX = 0,
          opacity = '1',
          duration = '0',
          closeButton = this.balloon.querySelector('.addToHomeClose');

        if ( closeButton ) closeButton.removeEventListener('click', close, false);

        if ( this.OSVersion < 5 ) {
          posY = this.isIPad ? window.scrollY - this.startY : window.scrollY + window.innerHeight - this.startY;
          posX = this.isIPad ? window.scrollX - this.startX : window.scrollX + Math.round((w.innerWidth - this.balloon.offsetWidth)/2) - this.startX;
        }

        this.balloon.style.webkitTransitionProperty = '-webkit-transform,opacity';

        if ( this.isIPad ) {
          duration = '0.4s';
          opacity = '0';
          posY = posY + 50;
        } else {
          duration = '0.6s';
          posY = posY + this.balloon.offsetHeight + options.bottomOffset + 50;
        }

        this.balloon.addEventListener('webkitTransitionEnd', transitionEnd, false);
        this.balloon.style.opacity = opacity;
        this.balloon.style.webkitTransitionDuration = duration;
        this.balloon.style.webkitTransform = 'translate3d(' + posX + 'px,' + posY + 'px,0)';
      },

      transitionEnd: function transitionEnd () {
        this.balloon.removeEventListener('webkitTransitionEnd', transitionEnd, false);

        this.balloon.style.webkitTransitionProperty = '-webkit-transform';
        this.balloon.style.webkitTransitionDuration = '0.2s';
      },

      setPosition: function setPosition () {
        var matrix = new WebKitCSSMatrix(w.getComputedStyle(this.balloon, null).webkitTransform),
          posY = this.isIPad ? window.scrollY - this.startY : window.scrollY + window.innerHeight - this.startY,
          posX = this.isIPad ? window.scrollX - this.startX : window.scrollX + Math.round((w.innerWidth - this.balloon.offsetWidth) / 2) - this.startX;

        // Screen didn't move
        if ( posY == matrix.m42 && posX == matrix.m41 ) return;

        this.balloon.style.webkitTransform = 'translate3d(' + posX + 'px,' + posY + 'px,0)';
      }

    }

    return add2home;

  }
);
