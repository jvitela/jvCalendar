document.addEventListener("DOMContentLoaded", function() {
    /*
    var today    = new Date();
    var clndr    = new Calendar({
      minDate: new Date( today.getFullYear(), today.getMonth() - 0,  0),
      maxDate: new Date( today.getFullYear(), today.getMonth() + 1,  1)
    });
    var clndr    = new Calendar({
      minDate: new Date( today.getFullYear(), today.getMonth() - 1,  1),
      maxDate: new Date( today.getFullYear(), today.getMonth() + 2,  0)
    });
    */

    var calendar = new CalendarView({
      el:       document.getElementById("Calendar"),
      //model:    new Calendar({ numMonths: 12 }),
      model:    new Calendar({ numWeeks: 6, firstDay: 1 }),
      template: document.getElementById("CalendarTemplate").innerHTML
    });

    function datetoStr(dt) {
      return dt.getDate() + '/' + calendar.nameOfTheMonths[dt.getMonth()] + '/' + dt.getFullYear();
    }

    calendar.el.addEventListener("dateselected",function( event) {
      document.getElementById("Selection").value = datetoStr(event.detail.date);
    });

    document.getElementById("Today").addEventListener("click", function() {
      var today = new Date();
      document.getElementById("Selection").value = datetoStr(today);
      calendar.model.selected = today;
      calendar.model.moveToSelectedDate();
      calendar.render();
    });

    calendar.render();
});

