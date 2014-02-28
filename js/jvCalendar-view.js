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
    CustomEvent.prototype = window.CustomEvent.prototype;
    window.CustomEvent = CustomEvent;
  }

  /**
   * Constructor
   */
  function CalendarView(opts) {
    var key, Me = this;
    this.options = opts || {};
    for (key in this.defaults) {
      if (this.defaults.hasOwnProperty(key) && !this.options.hasOwnProperty(key)) {
        this.options[key] = this.defaults[key];
      }
    }

    this.model = this.options.model || new CalendarModel();
    this.el    = this.options.el    || document.createElement("div");

    // Delegate click events
    this.el.addEventListener("click", function (e) {
      return Me.onClick(e);
    });
  }

  CalendarView.prototype = {
    /**
     * Options
     */
    defaults: {
      template: '<button data-month="-1">&lt;</button><span>{{month}} &nbsp; {{year}}</span><button data-month="+1">&gt;</button><br><table><thead><tr><th>{{weekNum}}</th>{{#daysOfTheWeek}}<th>{{.}}</th>{{/daysOfTheWeek}}</tr></thead><tbody>{{#weeks}}<tr><th>{{num}}</th>{{#days}}<td class="{{#otherMonth}}other-month{{/otherMonth}} {{#disabled}}disabled{{/disabled}}" data-timestamp="{{timestamp}}">{{#selected}}<b>{{day}}</b>{{/selected}}{{^selected}}{{day}}{{/selected}}</td>{{/days}}</tr>{{/weeks}}</tbody></table>',
      nameOfTheMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      daysOfTheWeek:   ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    },

    /**
     * Renders the calendar
     * @returns self
     */
    render: function () {
      var clndr           = this.model.build();
      clndr.month         = this.options.nameOfTheMonths[clndr.month];
      clndr.daysOfTheWeek = this.options.daysOfTheWeek;
      this.el.innerHTML   = Mustache.render(this.options.template, clndr);
      return this;
    },

    /**
     * Delegates click events
     */
    onClick: function (event) {
      var target = event.target;

      // Bubble the elements if necessary
      while (target && target !== this.el) {
        // Move to another month
        if (target.hasAttribute("data-month")) {
          return this.onChangeMonth(event, target);
        }
        // Move to another year
        if (target.hasAttribute("data-year")) {
          return this.onChangeYear(event, target);
        }
        // Go to selected timestamp
        if (target.hasAttribute("data-timestamp")) {
          return this.onChangeDate(event, target);
        }

        target = target.parentNode;
      }
      return false;
    },

    /**
     * Move month
     */
    onChangeMonth: function (event, target) {
      event.preventDefault();
      var num = target.getAttribute("data-month");
      this.model.moveMonth(parseInt(num, 10));
      this.render();
    },

    /**
     * Move year
     */
    onChangeYear: function (event, target) {
      event.preventDefault();
      var num = target.getAttribute("data-year");
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
    onChangeDate: function (event, target) {
      var date, evt, dtl;
      event.preventDefault();
      if (/disabled/.test(target.className) || target.hasAttribute("disabled")) {
        return false;
      }
      date = new Date(parseInt(target.getAttribute("data-timestamp"), 10));
      this.model.option("selected", date);
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
