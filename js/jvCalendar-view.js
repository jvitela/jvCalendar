/**
 *  Simple Calendar View
 *  This is created as a lightweight jQuery-UI Datepicker replacement
 *
 *  Minimal template:
 *        <div><!-- root element -->
 *          <button class=\"btn-prev-month\">&lt;</button>
 *          <span>{{month}} &nbsp; {{year}}</span>
 *          <button class=\"btn-next-month\">&gt;</button>
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
 *              <td class=\"day {{classes}} {{#disabled}}disabled{{/disabled}}\" data-value="{{value}}">
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
	var CustomEvent = function CustomEvent ( event, params ) {
	  var evt = document.createEvent( 'CustomEvent' );
	  params = params || { bubbles: false, cancelable: false, detail: undefined };
	  evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
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

    // Delegate events
    this.el.addEventListener("click", function (e) {
	  var target = e.target;
	  while (target && target !== Me.el) {
        if (/btn-next-month/.test(target.className)) {
		  return Me.onNextMonth(e);
		}
		if (/btn-prev-month/.test(target.className)) {
		  return Me.onPrevMonth(e);
		}
		if (/day/.test(target.className)) {
		  return Me.onSelectDay(e);
	    }
		target = target.parentNode;
	  }
      return false;
    });
  }

  CalendarView.prototype = {
    /**
     * Options
     */
    defaults: {
      template: '<button class="btn-prev-month">&lt;</button><span>{{month}} &nbsp; {{year}}</span><button class="btn-next-month">&gt;</button><br><table><thead><tr><th>{{weekNum}}</th>{{#daysOfTheWeek}}<th>{{.}}</th>{{/daysOfTheWeek}}</tr></thead><tbody>{{#weeks}}<tr><th>{{num}}</th>{{#days}}<td class="day {{classes}} {{#disabled}}disabled{{/disabled}}" data-value="{{value}}">{{#selected}}<b>{{day}}</b>{{/selected}}{{^selected}}{{day}}{{/selected}}</td>{{/days}}</tr>{{/weeks}}</tbody></table>',
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
     * Go to next month
     */
    onNextMonth: function (event) {
      event.preventDefault();
      this.model.nextMonth();
      this.render();
    },
    /**
     * Go to previous month
     */
    onPrevMonth: function (event) {
      event.preventDefault();
      this.model.prevMonth();
      this.render();
    },

    /**
     * A day was selected
     *
     * @param   event The Dom event
     *
     * @returns false, triggers "dayselected" event in the view
     */
    onSelectDay: function (event) {
      var date, evt;
      event.preventDefault();
      if (/disabled/.test(event.target.className)) {
        return false;
      }
      date = new Date(+event.target.getAttribute("data-value"));
      this.model.option("selected", date);
      // Trigger a custom event
      evt = new CustomEvent("dayselected", {"date": date, "model": this.model});
      evt.date  = date;
      evt.model = this.model;
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
