/**
 * Simple Calendar Model
 * This model holds the config data for generating a calendar,
 * to get the calendar data, use the method "build"
 *
 * This model make no assumptions about the format used for display
 */
(function () {

  "use strict";

  /**
   * Constructor
   */
  function CalendarModel(opts) {
    var key;
    this.options = opts || {};
    for (key in this.defaults) {
      if (this.defaults.hasOwnProperty(key) && !this.options.hasOwnProperty(key)) {
        this.options[key] = this.defaults[key];
      }
    }
    this._initDates();
  }

  CalendarModel.prototype = {
    /**
     * Building Attributes
     */
    defaults: {
      selected: new Date(),
      minDate:  false,
      maxDate:  false,
      firstDay: 0,          // Set the first day of the week: Sunday is 0, Monday is 1, etc.
      numWeeks: "auto"      // Number of weeks to display per month
    },

    /**
     * Generate template data
     *
     * @returns object
     */
    build: function () {
      return {
        prev:  this.canPrevMonth(),
        next:  this.canNextMonth(),
        month: this._cursor.getMonth(),
        year:  this._cursor.getFullYear(),
        weeks: this._getCalendarDaysByWeek()
      };
    },

    /**
     * Move cursor to next {num} months
     * @param num number The number of months to move
     */
    moveMonth: function (num) {
      if (num > 0 && !this.canNextMonth(num)) {
        return false;
      }
      if (num < 0 && !this.canPrevMonth(num)) {
        return false;
      }

      // go to the beginning of next month
      this._cursor = new Date(this._cursor.getFullYear(), this._cursor.getMonth() + num, 1);
      return true;
    },

    /**
     *  Verify if we can go to prev month
     */
    canPrevMonth: function (num) {
      if (!(this._minDate instanceof Date)) {
        return true;
      }
      // go to end of previous month, which is one minute back from beginning of current month
      var cursor  = new Date(this._cursor.getFullYear(), this._cursor.getMonth() - num + 1, 1, 0, -1);
      return (cursor >= this._minDate);
    },

    /**
     *  Verify if we can go to next month
     */
    canNextMonth: function (num) {
      if (!(this._maxDate instanceof Date)) {
        return true;
      }
      // go to the beginning of next month
      var cursor = new Date(this._cursor.getFullYear(), this._cursor.getMonth() + num, 1);
      // Check if a max date is set
      return (cursor <= this._maxDate);
    },

    /**
     * set/get option value
     */
    option: function (name, value) {
      if (value === "undefined") {
        return this.options[name];
      }

      this.options[name] = value;
      this._initDates();
      return this;
    },

    /**
     * Initializes date values
     */
    _initDates: function () {
      var selected = this.options.selected,
        minDate    = this.options.minDate,
        maxDate    = this.options.maxDate;

      if (minDate instanceof Date) {
        minDate  = (minDate < maxDate)  ? minDate : maxDate;
        selected = (minDate > selected) ? minDate : selected;
      }

      if (maxDate instanceof Date) {
        maxDate  = (minDate > maxDate)  ? minDate : maxDate;
        selected = (maxDate < selected) ? maxDate : selected;
      }

      this._cursor   = new Date(selected.getFullYear(), selected.getMonth(),  1);
      this._selected = new Date(selected.getTime());
      this._minDate  = minDate && new Date(minDate.getTime());
      this._maxDate  = maxDate && new Date(maxDate.getTime());
    },

    /**
     * Return array of days for the template
     */
    _getCalendarDays: function () {
      // Get first day of current month
      var cur, i,
        dt       = new Date(this._cursor.getTime()),
        offsetDays = dt.getDay() - this.options.firstDay, // Get day of week
        days       = [],
        numDays    = this.options.numWeeks;

      // Get number of days to display
      if (typeof numDays === "number" && numDays > 0) {
        numDays = this.options.numWeeks * 7;
      } else {
        cur = new Date(this._cursor.getFullYear(), this._cursor.getMonth() + 1, 0);
        numDays = cur.getDate() + offsetDays + (6 - cur.getDay());
      }

      // set initial date
      dt.setDate(1 - offsetDays);
      // Calculate each day
      for (i = 0; i < numDays; ++i) {
        days.push(this._getDayInfo(dt));
        dt.setDate(dt.getDate() + 1);
      }
      return days;
    },

    /**
     * Get Calendar days grouped by weeks
     * calls _getCalendarDays
     */
    _getCalendarDaysByWeek: function () {
      // Group days by week
      var i         = 0,
        weeks       = [],
        calDays     = this._getCalendarDays(),
        daysInWeek  = 7,
        numWeeks    = calDays.length / daysInWeek,
        weekDays;

      while (weeks.length < numWeeks) {
        weekDays = calDays.slice(i, i + daysInWeek);
        weeks.push(this._getWeekInfo(weekDays));
        i += daysInWeek;
      }
      return weeks;
    },

    /**
     * Returns day info
     *
     * @param dt Date
     *
     * @returns object
     */
    _getDayInfo: function (dt) {
      var sel        = this._selected, // The selected date
        cal          = this._cursor,   // The current calendar position
        isSelected   = false,
        isOtherMonth = false,
        minDate      = this._minDate,
        maxDate      = this._maxDate,
        isDisabled   = ((minDate && dt < minDate) || (maxDate && dt > maxDate));

      if (dt.getDate()     === sel.getDate()  &&
          dt.getMonth()    === sel.getMonth() &&
          dt.getFullYear() === sel.getFullYear()
          ) {
        isSelected = true;
      }

      if (dt.getFullYear() !== cal.getFullYear() ||
          dt.getMonth()    !== cal.getMonth()
          ) {
        isOtherMonth = true;
      }

      return {
        otherMonth: isOtherMonth,
        disabled:   isDisabled,
        selected:   isSelected,
        day:        dt.getDate(),
        timestamp:  dt.getTime()
      };
    },

    /**
     *
     * @param weekDays array
     * @param weekNum  number
     *
     * @returns object
     */
    _getWeekInfo: function (weekDays) {
      var thursday = 4 - this.options.firstDay;
      return {
        num:  this.calculateWeek(new Date(weekDays[thursday].timestamp)),
        days: weekDays
      };
    },

    /**
     * Determine the week of the year based on the ISO 8601 definition.
     * copied from jQuery-UI
     *
     * @param  date The date to get the week for
     *
     * @return The number of the week within the year that contains this date
     */
    calculateWeek: function (date) {
      var time,
        checkDate = new Date(date.getTime());

      // Find Thursday of this week starting on Monday
      checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));

      time = checkDate.getTime();
      checkDate.setMonth(0); // Compare with Jan 1
      checkDate.setDate(1);
      return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
    }

  };

  window.CalendarModel = CalendarModel;
}(window));
