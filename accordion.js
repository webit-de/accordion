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
      animationSpeed: 300,
      naturalBehavior: false,
      accordion: '.accordion',
      accordion_content: '.accordion-content',
      accordion_header: '.accordion-header',
      accordion_opened: '.accordion-opened',
      accordion_item_tagName: undefined,
      accordion_item_className: 'accordion-item',
      class_accordion_active: 'accordion-active'
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
        .removeAttr('id role tabindex aria-selected aria-controls')
        .removeClass(Accordion.options.class_accordion_active);

        $accordion_group.find(Accordion.options.accordion_content)
        .removeAttr('aria-expanded role aria-hidden aria-labelledby style id')
        .removeClass(Accordion.options.accordion_opened.replace('.', ''));

        Accordion.$accordion_header.off('.accordion');
      }
    },

    /**
    * Bind events to all interactive elements.
    * @function _bindEvents
    * @param {Object} accordion - Current accordion from setup loop.
    * @private
    */
    _bindEvents: function(accordion) {
      // Click accordion header
      accordion.on('click.accordion', Accordion.options.accordion_header, function(event) {
        event.preventDefault();

        Accordion._closeAll($(this));
        Accordion._toggleAccordion($(this));
      });

      // tab to accordion header and press space bar
      accordion.on('keydown.accordion', Accordion.options.accordion_header, function(event) {
        if (event.keyCode === 32) {
          event.preventDefault();
          Accordion._toggleAccordion($(this));
        }
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
      this.$accordion_content.attr('aria-expanded', 'false').attr('role', 'tabpanel').hide();
      this.$accordion_header.attr('role', 'tab').attr('tabindex', '0').attr('aria-selected', 'false');

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
    * @param {Object} accordion - jQuery object with current accordion from setup loop.
    * @param {Object} index - index from setup loop.
    * @private
    */
    _setupAccordionItems: function(accordion, index) {
      var
      $accordion_header = accordion.find(Accordion.options.accordion_header),
      $accordion_content = accordion.find(Accordion.options.accordion_content),
      $currentAccordionHeader,
      $currentAccordionContent,

      loop_index = $accordion_header.length > $accordion_content.length ? $accordion_header.length : $accordion_content.length;

      for (var i = 0; i < loop_index; i++) {

        if ($accordion_header[i] && $accordion_content[i]) {
          $currentAccordionHeader = $($accordion_header[i]);
          $currentAccordionContent = $($accordion_content[i]);

          // set IDs
          $currentAccordionHeader
          .attr('id', 'accordion-' + index + '-header-' + index);

          $currentAccordionContent
          .attr('id', 'accordion-' + index + '-content-' + index);

          // set aria-controls
          $currentAccordionHeader
          .attr('aria-controls', $currentAccordionContent.attr('id'));

          // set aria-labelledby
          $currentAccordionContent
          .attr('aria-labelledby', $currentAccordionHeader.attr('id'));

          if(Accordion.options.accordion_item_tagName) {
            try {

              var
              clonedHeaderElement,
              newElement = document.createElement(Accordion.options.accordion_item_tagName);

              if (newElement instanceof HTMLUnknownElement === false) {
                clonedHeaderElement = $accordion_header[i].cloneNode(true);

                newElement.className = Accordion.options.accordion_item_className;
                newElement.appendChild(clonedHeaderElement);
                newElement.appendChild($accordion_content[i]);

                $($accordion_header[i]).replaceWith(newElement);
              }
            } catch (e) {
              console.log(e);
            }

          }
        }
      }

    },

    /**
    * Close all open accordion entries within one accordion for natural behavior.
    * @function _closeAll
    * @private
    * @param {Object} accordion_header - The clicked accordion header.
    */
    _closeAll: function(accordion_header) {
      var
      opened = accordion_header.closest('.accordion').find('.' + Accordion.options.class_accordion_active);

      // close opened entry when option is set and the open entry is not the clicked
      if(this.options.naturalBehavior && !opened.is(accordion_header)) {
        this._closeAccordion(opened);
      }
    },

    /**
    * Open a single accordion entry and trigger events.
    * @function _openAccordion
    * @private
    * @param {Object} accordion_header - The clicked accordion header.
    */
    _openAccordion: function(accordion_header) {
      var
      accordion_content = accordion_header.next();

      // trigger event before the accordion opens
      accordion_header.trigger('accordion.beforeOpen', [accordion_header, accordion_content]);

      // accordion-header
      accordion_header.attr('aria-selected', 'true').addClass(Accordion.options.class_accordion_active);

      // accordion-content
      accordion_content.attr('aria-expanded', 'true').attr('aria-hidden', 'false');

      accordion_content.slideDown(Accordion.options.animationSpeed, function() {
        accordion_header.trigger('accordion.opened', [accordion_header, accordion_content]);
      });

    },

    /**
    * Close a single accordion entry and trigger events.
    * @function _closeAccordion
    * @private
    * @param {$Object} $accordion_header - The clicked accordion header.
    */
    _closeAccordion: function($accordion_header) {

      var
      $accordion_content = $accordion_header.next();

      // trigger event before the accordion closes
      $accordion_header.trigger('accordion.beforeClose', [$accordion_header, $accordion_content]);


      // accordion-header
      $accordion_header.attr('aria-selected', 'false').removeClass(Accordion.options.class_accordion_active);

      // accordion-content
      $accordion_content.attr('aria-expanded', 'false').attr('aria-hidden', 'true');

      $accordion_content.slideUp(Accordion.options.animationSpeed, function() {
        $accordion_header.trigger('accordion.closed', [$accordion_header, $accordion_content]);
      });

    },

    /**
    * Toggle the accordion entry.
    * @function _toggleAccordion
    * @private
    * @param {Object} accrodion_header - The clicked accordion header.
    */
    _toggleAccordion: function(accordion_header) {

      if (accordion_header.attr('aria-selected') === 'false') {
        // open:
        this._openAccordion(accordion_header);
      } else {
        // close:
        this._closeAccordion(accordion_header);
      }
    },

    /**
    * Open a single accordion entry via a hash in the URL.
    * @function _openAccordionViaHash
    * @private
    * @param {Object} accrodion_header - The clicked accordion header.
    */
    _openAccordionViaHash: function() {
      // find linked accordion content and click
      // corresponding .accordion-header to open it
      if(window.location.hash) {
        $(window.location.hash).prev().trigger('click');
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
        Accordion.$accordion_opened.each(function() {

          // only open if it is not linked via url window.location.hash
          if(window.location.hash != ('#' + this.id)) {
            $(this).prev().trigger('click');
          }

        });
      });
    }
  };

  return /** @alias module:Accordion */ {
    /** init */
    init: Accordion.init,
    /** destroy */
    destroy: Accordion.destroy
  };

});
