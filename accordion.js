define(['jquery', 'jquery.exists'], function($) {

  'use strict';

  /*
  * simple and accessible accordion
  * @author mail@markus-falk.com
  * @requires jQuery 1.7+
  */

  var Accordion = {

    /**
    * Defaults to be extended into options
    */
    DEFAULTS: {
      animationSpeed: 300, // accordion-toggle animation speed
      closeOtherAccordionItems: false, // after open accordion-item, close other accordion-items
      accordion: '.accordion', // accordion-wrapper className
      accordion_content: '.accordion-content', // accordion-item content className
      accordion_header: '.accordion-header', // accordion-item header className
      accordion_opened: '.accordion-opened', // className to set initial opened accordion-item
      accordion_item_tagName: undefined, // tagName to wrap accordion-item (accordion-header & accordion-content)
      accordion_item_className: 'accordion-item', // className for accordion-item wrapper-element
      class_accordion_active: 'accordion-active', // className for current opened accordion-header-item
      class_accordion_show: 'accordion-show' // className for current shown accordion-content-item
    },

    /**
    * Extend defaults with customized options.
    * @function _setOptions
    * @param {Object} options - .
    * @private
    */
    _setOptions: function(options) {
      // extend DEFAULTS with given options
      this.options = $.extend({}, Accordion.DEFAULTS, options);
    },

    /**
    * Cache jQuery elements.
    * @function _cacheElements
    * @private
    */
    _cacheElements: function() {
      this.$accordion = $(Accordion.options.accordion);
      this.$accordion_content = this.$accordion.find(Accordion.options.accordion_content);
      this.$accordion_header = this.$accordion.find(Accordion.options.accordion_header);
      this.$accordion_opened = this.$accordion.find(Accordion.options.accordion_opened);
    },

    /**
    * Initialize the accordion.
    * @function init
    * @public
    * @param {Object} options - The properties you would like to overwrite.
    */
    init: function(options) {
      Accordion._setOptions(options);
      Accordion._cacheElements();
      Accordion.$accordion.exists(function() {
        Accordion._setupAccordion();
        Accordion._openAccordionViaClass();
        Accordion._openAccordionViaHash();
      });
    },

    /**
    * Initialize the accordion.
    * @function destroy
    * @public
    */
    destroy: function($accordion_group) {
      if ($accordion_group.length) {
        $accordion_group.removeAttr('role');
        $accordion_group.data('name', null);

        $accordion_group.find(Accordion.options.accordion_header)
        .removeAttr('id role tabindex aria-controls aria-expanded aria-selected')
        .removeClass(Accordion.options.class_accordion_active);

        $accordion_group.find(Accordion.options.accordion_content)
        .removeAttr('id role aria-labelledby aria-hidden style')
        .removeClass(Accordion.options.class_accordion_show)
        .removeClass(Accordion.options.accordion_opened.replace('.', ''));

        Accordion.$accordion_header.off('.accordion');
      }
    },

    /**
    * Bind events to all interactive elements.
    * @function _bindEvents
    * @param {JQuery} accordion - Current accordion from setup loop.
    * @private
    */
    _bindEvents: function($accordion) {
      // Click accordion header
      $accordion.on('click.accordion', Accordion.options.accordion_header, function(event) {
        event.preventDefault();

        Accordion._closeOtherAccordionItems($(this));
        Accordion._toggleAccordion($(this));
      });

      // tab to accordion header and press space bar
      $accordion.on('keydown.accordion', Accordion.options.accordion_header, function(event) {
        if (event.keyCode === 32) {
          event.preventDefault();
          Accordion._toggleAccordion($(this));
        }
      });

      $accordion.on('scrollToAccordion', Accordion.options.accordion_header, function(event) {
        Accordion._scrollToAccodionID();
      });

    },

    /**
    * Setup HTML and trigger custom events.
    * @function _setupAccordion
    * @private
    */
    _setupAccordion: function() {
      // set html attributes
      this.$accordion.attr('role', 'tablist');
      this.$accordion_header.attr('role', 'tab').attr('tabindex', '0').attr('aria-expanded', 'false').attr('aria-selected', 'false');
      this.$accordion_content.attr('role', 'tabpanel').attr('aria-hidden', 'true').hide();

      // set up each accordion
      this.$accordion.each(function(index) {
        var $this = $(this);

        if(!$this.data('name')) {

          // save state
          $this.data('name', 'accordion');

          // setup
          Accordion._setupAccordionItems($this, index);
          Accordion._bindEvents($this);

          // publish event with current accordion
          $this.trigger('accordion.initialized', $this);

        }

        $this.data('accordion-settings', Accordion.options);
      });
    },

    /**
    * loop throught accodrion items within each accordion.
    * @function _setupAccordionItems
    * @param {JQuery} accordion - jQuery object with current accordion from setup loop.
    * @param {Object} index - index from setup loop.
    * @private
    */
    _setupAccordionItems: function($accordion, index) {
      var
      $accordion_header = $accordion.find(Accordion.options.accordion_header),
      $accordion_content = $accordion.find(Accordion.options.accordion_content),
      $currentAccordionHeader,
      $currentAccordionContent,

      loop_index = $accordion_header.length > $accordion_content.length ? $accordion_header.length : $accordion_content.length;

      for (var i = 0; i < loop_index; i++) {

        if ($accordion_header[i] && $accordion_content[i]) {
          $currentAccordionHeader = $($accordion_header[i]);
          $currentAccordionContent = $($accordion_content[i]);

          // set IDs
          $currentAccordionHeader
          .attr('id', Accordion._getAccodionHeaderID(index, i));

          $currentAccordionContent
          .attr('id', Accordion._getAccodionContentID(index, i));
          // set aria-controls
          $currentAccordionHeader
          .attr('aria-controls', $currentAccordionContent.attr('id'));

          // set aria-labelledby
          $currentAccordionContent
          .attr('aria-labelledby', $currentAccordionHeader.attr('id'));

          // wrapp accordion-item with given tabName and tagClass
          if(Accordion.options.accordion_item_tagName) {
            try {

              var
              firstAccordionElement,
              secondAccordionElement,
              newWrapperElement = document.createElement(Accordion.options.accordion_item_tagName);

              if (newWrapperElement instanceof HTMLUnknownElement === false) {

                if ($accordion_header[i].nextElementSibling === $accordion_content[i]) {
                  // accordion_header is the first, accordion_content is the following element
                  firstAccordionElement = $accordion_header[i];
                  secondAccordionElement = $accordion_content[i];
                } else if ($accordion_header[i].previousElementSibling === $accordion_content[i]) {
                  // accordion_content is the first, accordion_header is the following element
                  firstAccordionElement = $accordion_content[i];
                  secondAccordionElement = $accordion_header[i];
                }


                newWrapperElement.className = Accordion.options.accordion_item_className;
                newWrapperElement.appendChild(firstAccordionElement.cloneNode(true));
                newWrapperElement.appendChild(secondAccordionElement);

                $(firstAccordionElement).replaceWith(newWrapperElement);
              }
            } catch (e) {
              console.log(e);
            }

          }
        }
      }

    },

    /**
    * Close other opened accordion-items within accordion for natural behavior.
    * @function _closeOtherAccordionItems
    * @private
    * @param {JQuery} accordion_header - The clicked accordion header.
    */
    _closeOtherAccordionItems: function($accordion_header) {
      var
      $opened = $accordion_header.closest(Accordion.options.accordion).find('.' + Accordion.options.class_accordion_active);

      // close $opened entry when option is set and the open entry is not the clicked
      if(this.options.closeOtherAccordionItems && !$opened.is($accordion_header)) {
        this._closeAccordion($opened);
      }
    },

    /**
    * Open a single accordion entry and trigger events.
    * @function _openAccordion
    * @private
    * @param {JQuery} accordion_header - The clicked accordion header.
    */
    _openAccordion: function($accordion_header) {
      var
      accordion_content = document.getElementById(Accordion._getAccodionContentID($accordion_header.attr('id'))),
      $accordion_content = $(accordion_content);

      // trigger event before the accordion opens
      $accordion_header.trigger('accordion.beforeOpen', [$accordion_header, $accordion_content]);

      // accordion-header
      $accordion_header.attr('aria-expanded', 'true').attr('aria-selected', 'true').addClass(Accordion.options.class_accordion_active);

      // accordion-content
      $accordion_content.attr('aria-hidden', 'false');

      $accordion_content.slideDown(Accordion.options.animationSpeed, function() {
        $accordion_content.addClass(Accordion.options.class_accordion_show);
        $accordion_header.trigger('accordion.opened', [$accordion_header, $accordion_content]);
      });

    },

    /**
    * Close a single accordion entry and trigger events.
    * @function _closeAccordion
    * @private
    * @param {JQuery} $accordion_header - The clicked accordion header.
    */
    _closeAccordion: function($accordion_header) {

      var
      accordion_content = document.getElementById(Accordion._getAccodionContentID($accordion_header.attr('id'))),
      $accordion_content = $(accordion_content);

      // trigger event before the accordion closes
      $accordion_header.trigger('accordion.beforeClose', [$accordion_header, $accordion_content]);

      // accordion-header
      $accordion_header.attr('aria-expanded', 'false').attr('aria-selected', 'false').removeClass(Accordion.options.class_accordion_active);

      // accordion-content
      $accordion_content.attr('aria-hidden', 'true');

      $accordion_content.slideUp(Accordion.options.animationSpeed, function() {
        $accordion_content.removeClass(Accordion.options.class_accordion_show);
        $accordion_header.trigger('accordion.closed', [$accordion_header, $accordion_content]);
      });

    },

    /**
    * Toggle the accordion entry.
    * @function _toggleAccordion
    * @private
    * @param {JQuery} accrodion_header - The clicked accordion header.
    */
    _toggleAccordion: function($accordion_header) {

      if ($accordion_header.attr('aria-selected') === 'false') {
        // open:
        this._openAccordion($accordion_header);
      } else {
        // close:
        this._closeAccordion($accordion_header);
      }
    },

    /**
    * Open a single accordion entry via a hash in the URL.
    * @function _openAccordionViaHash
    * @private
    */
    _openAccordionViaHash: function() {
      // find accordion-header by accordion-content-id within url

      if(window.location.hash) {
        var
        hashForContentID = window.location.hash.replace('#',''),
        accordion_header = document.getElementById(Accordion._getAccodionHeaderID(hashForContentID)),
        $accordion_header = $(accordion_header);

        if (accordion_header && accordion_header.className.indexOf(Accordion.options.class_accordion_active) === -1) {
          $accordion_header.trigger('click');
        }

        $accordion_header.trigger('scrollToAccordion');
      }
    },

    /**
    * If a hash is provided that matches the accordion header's ID this entry is opened.
    * @function _openAccordionViaClass
    * @private
    */
    _openAccordionViaClass: function() {
      // open accordion content with class
      // 'accordion-opened'
      this.$accordion_opened.exists(function() {
        var
        accordion_header,
        $accordion_header;

        Accordion.$accordion_opened.each(function(index, accordion_content_opened) {

          // only open if it is not linked via url window.location.hash
          if(window.location.hash != ('#' + accordion_content_opened.id)) {
            accordion_header = document.getElementById(Accordion._getAccodionHeaderID(accordion_content_opened.id)),
            $accordion_header = $(accordion_header);

            $accordion_header.trigger('click');
          }

        });
      });
    },

    /**
    * return accodion-Header-id string
    * @function _getAccodionHeaderID
    * @private
    * @param {String} idValue - Number represents the Header-Major-ID
    * @param {Number} idValue - String represents the current Header-ID-Attribute
    * @param {Number} idMinorCounter - represents the Header-Minor-ID
    * @return {String} - current Header-id String
    */
    _getAccodionHeaderID: function(idValue, idMinorCounter) {
      if (typeof idValue === typeof 1 && typeof idMinorCounter === typeof 1) {
        // create Header-id
        return 'accordion-' + idValue + '-header-' + idMinorCounter;
      } else if (typeof idValue === typeof "") {
        // return Content-id for current Header-id
        return idValue.replace('-content-', '-header-');
      }
    },

    /**
    * return accodion-Content-id string
    * @function _getAccodionContentID
    * @private
    * @param {String} idValue - Number represents the Content-Major-ID
    * @param {Number} idValue - String represents the current Content-ID-Attribute
    * @param {Number} idMinorCounter - represents the Content-Minor-ID
    * @return {String} - current Content-id String
    */
    _getAccodionContentID: function(idValue, idMinorCounter) {
      if (typeof idValue === typeof 1 && typeof idMinorCounter === typeof 1) {
        // create Content-id
        return 'accordion-' + idValue + '-content-' + idMinorCounter;
      } else if (typeof idValue === typeof "") {
        // return Header-id for current Content-id
        return idValue.replace('-header-', '-content-');
      }
    },

    /**
    * go to accordion-header-id
    * @function _scrollToAccodionID
    * @private
    */
    _scrollToAccodionID: function() {
      var
      element,
      accordionHeaderID = window.location.hash.replace('#','');

      try {
        element = document.getElementById(accordionHeaderID);

        if (element) {
          window.scrollTo({
            top: element.offsetTop,
            left: 0,
            behavior: 'smooth'
          });
        }
      } catch (e) {
        console.log(e);
      }
    },
  };

  return /** @alias module:Accordion */ {
    /** init */
    init: Accordion.init,
    /** destroy */
    destroy: Accordion.destroy
  };

});
