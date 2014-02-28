document.addEventListener("DOMContentLoaded", function() {
    /*
    var today    = new Date();
    var clndr    = new CalendarModel({
      minDate: new Date( today.getFullYear(), today.getMonth() - 0,  0),
      maxDate: new Date( today.getFullYear(), today.getMonth() + 1,  1)
    });
    var clndr    = new CalendarModel({
      minDate: new Date( today.getFullYear(), today.getMonth() - 1,  1),
      maxDate: new Date( today.getFullYear(), today.getMonth() + 2,  0)
    });
    */

    var calendar = new CalendarView({
      el:       document.getElementById("Calendar"),
      //model:    new CalendarModel({ numWeeks : 6 }),
      template: document.getElementById("CalendarTemplate").innerHTML
    });

    calendar.el.addEventListener("dateselected",function( event) {
      document.getElementById("Selection").value = event.detail.date.toString();
    });

    calendar.render();

    document.getElementById("Today").addEventListener("click", function() {
      var today = new Date();
      calendar.model.option("selected", today);
      document.getElementById("Selection").value = today.toString();
      calendar.render();
    });
});

