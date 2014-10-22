/**
 *  Simple Calendar View
 *  This is created as a lightweight calendar widget
 *
 *  Minimal template:
 *        <div><!-- root element -->
 *          <button data-month=\"-1\">&lt;</button>
 *          <span>{{month}} &nbsp; {{year}}</span>
 *          <button data-month=\"+1\">&gt;</button>
 *          <br>
 *          <table>
 *            <thead>
 *            <tr>
 *              <th>#Week</th>
 *              {{#daysOfTheWeek}}<th>{{.}}</th>{{/daysOfTheWeek}}
 *            </tr>
 *            </thead>
 *            <tbody>
 *            {{#weeks}}
 *            <tr>
 *              <th>{{num}}</th>
 *              {{#days}}
 *              <td class=\"{{#otherMonth}}other-month{{/otherMonth}} {{#disabled}}disabled{{/disabled}}\"
 *                  data-timestamp="{{timestamp}}">
 *               {{#selected}}<b>{{day}}</b>{{/selected}}
 *               {{^selected}}{{day}}{{/selected}}
 *              </td>
 *              {{/days}}
 *            </tr>
 *            {{/weeks}}
 *            </tbody>
 *          </table>
 *        </div>
 *
 *  Events triggered by this view:
 *    - dayselected
 */
(function () {

  "use strict";

  /**
   * Polyfill for Internet Explorer 9 and 10
   * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
   */
  if (typeof CustomEvent !== "function") {
    var CustomEvent = function CustomEvent(event, params) {
      var evt = document.createEvent('CustomEvent');
      params = params || {bubbles: false, cancelable: false, detail: undefined};
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };
    CustomEvent.prototype = window.CustomEvent? window.CustomEvent.prototype : {};
    window.CustomEvent = CustomEvent;
  }

  /**
   * Constructor
   */
  function CalendarView(opts) {
    var key, Me = this;
    

    this.template        = '<button data-month="-1">&lt;</button><span>{{month}} &nbsp; {{year}}</span><button data-month="+1">&gt;</button><br><table><thead><tr><th>{{weekNum}}</th>{{#daysOfTheWeek}}<th>{{.}}</th>{{/daysOfTheWeek}}</tr></thead><tbody>{{#weeks}}<tr><th>{{num}}</th>{{#days}}<td class="{{#otherMonth}}other-month{{/otherMonth}} {{#disabled}}disabled{{/disabled}}" data-timestamp="{{timestamp}}">{{#selected}}<b>{{day}}</b>{{/selected}}{{^selected}}{{day}}{{/selected}}</td>{{/days}}</tr>{{/weeks}}</tbody></table>';
    this.nameOfTheMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.daysOfTheWeek   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    for (key in opts) {
      if (this.hasOwnProperty(key)) {
        this[key] = opts[key];
      }
    }

    this.model = opts.model || new Calendar();
    this.el    = opts.el    || document.createElement("div");

    // Delegate click events
    this.el.addEventListener("click", function (e) {
      return Me.onClick(e);
    });
  }

  CalendarView.prototype = {

    /**
     * Renders the calendar
     * @returns self
     */
    render: function () {
      var clndr           = this.model.build();
      clndr.month         = this.nameOfTheMonths[clndr.month];
      clndr.daysOfTheWeek = this.daysOfTheWeek;
      this.el.innerHTML   = Mustache.render( this.template, clndr);
      
      console.log( clndr);
      return this;
    },

    /**
     * Delegates click events
     */
    onClick: function (event) {
      var target = event.target;

      // Bubble the elements if necessary
      while (target && target !== this.el) {
        // add a custom delegateTarget property to the event object 
        // So that event handlers can access the right target
        event.delegateTarget = target;

        // Move to another month
        if (target.hasAttribute("data-month")) {
          return this.onChangeMonth(event);
        }

        // Move to another year
        if (target.hasAttribute("data-year")) {
          return this.onChangeYear(event);
        }

        // Go to selected timestamp
        if (target.hasAttribute("data-timestamp")) {
          return this.onChangeDate(event);
        }

        target = target.parentNode;
      }
      return false;
    },

    /**
     * Move month
     */
    onChangeMonth: function (event) {
      event.preventDefault();
      var num = event.delegateTarget.getAttribute("data-month");
      this.model.moveMonth(parseInt(num, 10));
      this.render();
    },

    /**
     * Move year
     */
    onChangeYear: function (event) {
      event.preventDefault();
      var num = event.delegateTarget.getAttribute("data-year");
      this.model.moveYear(parseInt(num, 10));
      this.render();
    },

    /**
     * A day was selected
     *
     * @param   event The Dom event
     *
     * @returns false, triggers "dayselected" event in the view
     */
    onChangeDate: function (event) {
      var date, evt, dtl, target = event.delegateTarget;
      event.preventDefault();
      if (/disabled/.test(target.className) || target.hasAttribute("disabled")) {
        return false;
      }
      date = new Date(parseInt(target.getAttribute("data-timestamp"), 10));
      this.model.selected = date;
      // Trigger a custom event
      dtl = {"date": date, "model": this.model};
      evt = new CustomEvent("dateselected", {bubbles: true, cancelable: true, detail: dtl});
      this.el.dispatchEvent(evt);
      this.render();
      return false;
    },

    /**
     * destroy
     */
    destroy: function () {
      this.el.innerHTML = "";
    }
  };

  window.CalendarView = CalendarView;
}(window));
