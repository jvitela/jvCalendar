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
  function Calendar(opts) {
    var key;

    this.cursor     = false;
    this.selected   = false;
    this.minDate    = false;
    this.maxDate    = false;
    this.firstDay   = 0;         // Set the first day of the week: Sunday is 0, Monday is 1, etc.
    this.numMonths  = 1;
    this.numWeeks   = "auto";     // Number of weeks to display per month
    
    opts = opts || {};
    for (key in opts) {
      if (this.hasOwnProperty(key)) {
        this[key] = opts[key];
      }
    }

    this.initialize();
  }

  Calendar.prototype = {

    /**
     * Generate template data
     *
     * @returns object
     */
    build: function () {
      return {
        prev:  this.canPrevMonth(1),
        next:  this.canNextMonth(1),
        month: this.cursor.getMonth(),
        year:  this.cursor.getFullYear(),
        weeks: this.getCalendarDaysByWeek()
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
      this.cursor = new Date( this.cursor.getFullYear(), this.cursor.getMonth() + num, 1);
      return true;
    },

    /**
     *  Verify if we can go to prev month
     */
    canPrevMonth: function (num) {
      if (!(this.minDate instanceof Date)) {
        return true;
      }
      // go to end of previous month, which is one minute back from beginning of current month
      var cursor  = new Date(this.cursor.getFullYear(), this.cursor.getMonth() - num + 1, 1, 0, -1);
      return (cursor >= this.minDate);
    },

    /**
     *  Verify if we can go to next month
     */
    canNextMonth: function (num) {
      if (!(this.maxDate instanceof Date)) {
        return true;
      }
      // go to the beginning of next month
      var cursor = new Date(this.cursor.getFullYear(), this.cursor.getMonth() + num, 1);
      // Check if a max date is set
      return (cursor <= this.maxDate);
    },

    /**
     * Move cursor to next {num} years
     * @param num number The number of months to move
     */
    moveYear: function (num) {
      if (num > 0 && !this.canNextYear(num)) {
        return false;
      }
      if (num < 0 && !this.canPrevYear(num)) {
        return false;
      }

      // go to the beginning of next month
      this.cursor = new Date(this.cursor.getFullYear() + num, this.cursor.getMonth(), 1);
      return true;
    },

    /**
     *  Verify if we can go to prev year
     */
    canPrevYear: function (num) {
      if (!(this.minDate instanceof Date)) {
        return true;
      }
      // go to end of previous month, which is one minute back from beginning of current month
      var cursor  = new Date(this.cursor.getFullYear() - num + 1, this.cursor.getMonth(), 1, 0, -1);
      return (cursor >= this.minDate);
    },

    /**
     *  Verify if we can go to next year
     */
    canNextYear: function (num) {
      if (!(this.maxDate instanceof Date)) {
        return true;
      }
      // go to the beginning of next month
      var cursor = new Date(this.cursor.getFullYear() + num, this.cursor.getMonth(), 1);
      // Check if a max date is set
      return (cursor <= this.maxDate);
    },

    /**
     * Moves cursor to the month of the selected day
     */
    moveToSelectedDate: function () {
      if (this.selected instanceof Date) {
        this.cursor = new Date(this.selected.getFullYear(), this.selected.getMonth(), 1);
      }
    },

    /**
     * sets the cursor position
     */
    setCursor: function () {
      var today, selected, minDate, maxDate;

      today = new Date();
      today.setHours(0, 0, 0, 0);
      selected = this.selected || today;
      minDate  = this.minDate;
      maxDate  = this.maxDate;

      if( minDate instanceof Date) {
        selected = (minDate > selected) ? minDate : selected;
      }

      if( maxDate instanceof Date) {
        selected = (maxDate < selected) ? maxDate : selected;
      }

      if (this.selected) {
        this.selected = selected;
      }

      this.cursor   = new Date(selected.getFullYear(), selected.getMonth(), 1);
    },

    /**
     * Initializes date values
     */
    initialize: function () {
      var selected = this.selected || new Date(),
        minDate    = this.minDate,
        maxDate    = this.maxDate;

      if (minDate instanceof Date) {
        minDate  = (minDate < maxDate)  ? minDate : maxDate;
        selected = (minDate > selected) ? minDate : selected;
      }

      if (maxDate instanceof Date) {
        maxDate  = (minDate > maxDate)  ? minDate : maxDate;
        selected = (maxDate < selected) ? maxDate : selected;
      }

      if (this.selected) {
        this.selected = new Date(selected.getTime());
      }

      this.cursor   = new Date(selected.getFullYear(), selected.getMonth(),  1);
      this.minDate  = minDate && new Date(minDate.getTime());
      this.maxDate  = maxDate && new Date(maxDate.getTime());
    },

    /**
     * Return array of days for the template
     */
    getCalendarDays: function () {
      // Get first day of current month
      var cur, i,
        dt       = new Date(this.cursor.getTime()),
        offsetDays = dt.getDay() - this.firstDay, // Get day of week
        days       = [],
        numDays    = this.numWeeks;

      // Get number of days to display
      if (typeof numDays === "number" && numDays > 0) {
        numDays = this.numWeeks * 7;
      } else {
        numDays = 0;
        for( i = 1; i <= this.numMonths; ++i) {
          // get last day of the mont
          cur = new Date(this.cursor.getFullYear(), this.cursor.getMonth() + i, 0);
          numDays += cur.getDate();
        }
        numDays += offsetDays + (6 - cur.getDay());
      }

      // set initial date
      dt.setDate(1 - offsetDays);
      // Calculate each day
      for (i = 0; i < numDays; ++i) {
        days.push(this.getDayInfo(dt));
        dt.setDate(dt.getDate() + 1);
      }
      return days;
    },

    /**
     * Get Calendar days grouped by weeks
     * calls getCalendarDays
     */
    getCalendarDaysByWeek: function () {
      // Group days by week
      var i         = 0,
        weeks       = [],
        calDays     = this.getCalendarDays(),
        daysInWeek  = 7,
        numWeeks    = calDays.length / daysInWeek,
        weekDays;

      while (weeks.length < numWeeks) {
        weekDays = calDays.slice(i, i + daysInWeek);
        weeks.push(this.getWeekInfo(weekDays));
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
    getDayInfo: function (dt) {
      var sel        = this.selected, // The selected date
        cal          = this.cursor,   // The current calendar position
        isSelected   = false,
        isOtherMonth = false,
        minDate      = this.minDate,
        maxDate      = this.maxDate,
        isDisabled   = ((minDate && dt < minDate) || (maxDate && dt > maxDate)),
        isWeekend    = (dt.getDay()==0 || dt.getDay()==6);

      if (sel &&
          dt.getDate()     === sel.getDate()  &&
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
        weekend:    isWeekend,
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
    getWeekInfo: function (weekDays) {
      var thursday = 4 - this.firstDay;
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

  window.Calendar = Calendar;
}(window));
