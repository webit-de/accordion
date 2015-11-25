define(['jquery', 'jquery.exists'], function($) {

  'use strict';

  /************************************************************
    @author mail@markus-falk.com
    @description simple and accessible accordion
    @requires jQuery 1.7+
  *************************************************************/

  var Accordion = {
    DEFAULTS: {
      animationSpeed: 300,
      naturalBehavior: false,
      offsetTop: 0
    },
    cacheElements: function() {
      this.$window = $(window);
      this.$accordion = $('.accordion');
      this.$accordion_content = $('.accordion-content');
      this.$accordion_header = $('.accordion-header');
      this.$accordion_opened = $('.accordion-opened');
    },

    init: function(options) {
      Accordion.cacheElements();
      Accordion.$accordion.exists(function() {
        Accordion.setOptions(options);
        Accordion.addARIAlabels();
        Accordion.setupAccordion();
        Accordion.bindEvents();
        Accordion.openAccordionViaClass();
        Accordion.openAccordionViaHash();
      });
    },

    bindEvents: function() {
      // Click accordion header
      this.$accordion_header.on('click', function(event) {
        event.preventDefault();
        Accordion.closeAll($(this));
        Accordion.toggleAccordion($(this));
      });

      // tab to accordion header and press space bar
      this.$accordion_header.on('keydown', function(event) {
        if (event.keyCode === 32) {
          event.preventDefault();
          Accordion.toggleAccordion($(this));
        }
      });

      Accordion.$window.on('hashchange', function() {
        Accordion.openAccordionViaHash();
      });
    },

    setOptions: function(options) {
      // extend DEFAULTS with given options
      this.options = $.extend({}, Accordion.DEFAULTS, options);
    },

    setupAccordion: function() {
      this.$accordion.attr('role', 'tablist');
      this.$accordion_content.attr('aria-expanded', 'false').attr('role', 'tabpanel').hide();
      this.$accordion_header.attr('role', 'tab').attr('tabindex', '0').attr('aria-selected', 'false');

      this.$accordion.each(function() {
        $(this).trigger('accordion.initialized');
      });
    },

    addARIAlabels: function() {
      this.$accordion.each(function(index) {

        var
        that = $(this),
        $accordion_header = that.find('.accordion-header').attr('id', 'accordion-' + index),
        $accordion_content = that.find('.accordion-content').attr('id', 'accordion-' + index);

        $accordion_header.each(function (index){

          var that = $(this);

          // set IDs
          that
            .attr('id', that.attr('id') + '-header-' + index)
            .next()
            .attr('id', that.next().attr('id') + '-content-' + index);

          // set aria-controls
          that
            .attr('aria-controls', that.next().attr('id'));
        });

        $accordion_content.each(function() {
          var that = $(this);

          // set aria-labelledby
          that
            .attr('aria-labelledby', that.prev().attr('id'));
        });

      });
    },

    closeAll: function(accordion_header) {

      var opened = accordion_header.closest('.accordion').find('.accordion-active');

      // close opened entry when option is set and the open entry is not the clicked
      if(this.options.naturalBehavior && !opened.is(accordion_header)) {
        this.closeAccordion(opened);
      }
    },

    openAccordion: function(accordion_header) {

      var
      accordion_content = accordion_header.next();

      // accordion-header
      accordion_header.attr('aria-selected', 'true').addClass('accordion-active');

      // accordion-content
      accordion_content.attr('aria-expanded', 'true').attr('aria-hidden', 'false');

      accordion_content.slideDown(Accordion.options.animationSpeed, function() {
        accordion_header.trigger('accordion.opened', [accordion_header, accordion_content]);
      });

    },

    closeAccordion: function(accordion_header) {

      var
      accordion_content = accordion_header.next();

      // accordion-header
      accordion_header.attr('aria-selected', 'false').removeClass('accordion-active');

      // accordion-content
      accordion_content.attr('aria-expanded', 'false').attr('aria-hidden', 'true');

      accordion_content.slideUp(Accordion.options.animationSpeed, function() {
        accordion_header.trigger('accordion.closed', [accordion_header, accordion_content]);
      });

    },

    toggleAccordion: function(accordion_header) {

      if (accordion_header.attr('aria-selected') === 'false') {
        // open:
        this.openAccordion(accordion_header);
      } else {
        // close:
        this.closeAccordion(accordion_header);
      }
    },

    openAccordionViaHash: function() {
      // find linked accordion header with data-id and open
      // corresponding accordion content element
      if (window.location.hash) { // URL with hash found
        var offset_top = 0,
            $accordion_header = $('.accordion-header[data-id="' + window.location.hash.replace('#', '') + '"]');
        // check if accordon exists
        if ($accordion_header.length) {
          offset_top = $accordion_header.offset().top;
          // check if accordon is already opened
          if (!$accordion_header.hasClass('accordion-active')) {
            $accordion_header.trigger('click');
          }

          setTimeout(function() {
            Accordion.$window.scrollTop(offset_top - Accordion.options.offsetTop);
          }, 150);
        }
      }
    },

    openAccordionViaClass: function() {
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

  return {
    init: Accordion.init
  };

});
