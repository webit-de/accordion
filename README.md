# accordion

Simple Accordion Script (AMD, Bower).

* multiple tabs can be opened and closed independently
* multiple accordions can be used on the same page
* supports ARIA-roles
* falls back to simple heading > content hierarchy
* requires jQuery 1.7+

## HTML Setup

```html
<!-- add basic styling -->
<link rel="stylesheet" href="accordion-basic.css">

<!-- html -->
<div class="accordion">
  <h2 class="accordion-header">Accordion Header One (.accordion-opened)</h2>
  <div class="accordion-content accordion-opened">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
    proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  </div> <!-- accordion-content -->
  <h2 class="accordion-header">Accordion Header Two (#accordion-0-header-1)</h2>
  <div class="accordion-content">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
    proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  </div> <!-- accordion-content -->
</div> <!-- accordion -->
```

```javascript
requirejs(['accordion'], function(Accordion) {
  // Accordion needs to be initialized through its API with:
  Accordion.init();

  // destroy whole accordion functionality
  Accordion.destroy();
});
```

## Options

```javascript
Accordion.init({
  animationSpeed:  Number  // Default: 300 (in ms), accordion-toggle animation speed
  closeOtherAccordionItems:  Boolean  // Default: false, after open accordion-item, close other accordion-items
  accordion:  String  // Default: '.accordion', accordion-wrapper className
  accordion_content:  String  // Default: '.accordion-content', accordion-item content className
  accordion_header:  String  // Default: '.accordion-header', accordion-item header className
  accordion_opened:  String  // Default: '.accordion-opened', className fot opened accordion-item
  accordion_item_tagName:  String  // Default: undefined, tagName to wrap accordion-item (accordion-header & accordion-content)
  accordion_item_className:  String  // Default: 'accordion-item', className for accordion-item wrapper-element
  class_accordion_active:  String  // Default: 'accordion-active' className for current opened accordion-item
});
```

### animationSpeed

Sets the speed of the opening and closing animation of the accordion in milliseconds.

### closeOtherAccordionItems (naturalBehavior)

When set to true an entry will close upon opening another. When set to false you can open as many entries as you like.

## Events

```javascript
'accordion.initialized' // returns .accordion

'accordion.beforeOpen' // returns .accordion-header, .accordion-content
'accordion.opened' // returns .accordion-header, .accordion-content

'accordion.beforeClose' // returns .accordion-header, .accordion-content
'accordion.closed' // returns .accordion-header, .accordion-content
```

## Additional Features

### Open panel via URL hash

From another page you can link to a specific accordion-content via the given ID that will open that panel on the target page.

```html
<!-- will open the first accordion-content placed on accordion.html -->
<a href="accordion.html#accordion-0-content-0">Link to Page with Accordion</a>
```

### Open panel via class

```html
<!-- will open panel with accordion-opened class -->
<h2 class="accordion-header">Accordion Header One (.accordion-opened)</h2>
<div class="accordion-content accordion-opened">
  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
  quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
  cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
  proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</div> <!-- accordion-content -->
```

### Wrapper Element
You can create dynamically a accordion wrapper-element (.accordion-item), by setting the option ```accordion_item_tagName: 'div'```.

### invert accordion-header/content
Now you can swap the accordion-header/content element to e.g. display the content above the header.
Just switch the accordion-header/content in your initial Markup

## Known Issues

If ```javascript closeOtherAccordionItems``` is set to true the URL hash will take precedence over the 'accordion-opened' class opening an accordion content.

## Installation

```shell
bower install accordion
```
