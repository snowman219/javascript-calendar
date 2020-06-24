var strCalHtml = '';
var month = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
var weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
var work_weekdays = [0,1,1,1,1,1,0];
var month_length = [31,28,31,30,31,30,31,31,30,31,30,31];
var include_holidays = false;
var custom_holidays = [];
var include_exceptions = false;
var custom_exceptions = [];
var include_morat = false;
var morat_ranges = [];
var morat_repeat = [];

var today = new Date();
var begin_date = new Date(new Date().getFullYear(), 0, 1);
var start_day = begin_date.getDay()+1;

function day_title(day_name) {
  strCalHtml +="<TD WIDTH=35>"+day_name+"</TD>";
}

function check_holiday (dt_date) {  // check for marked holidays
// dt_date = new Date("2017-04-14T12:01:00Z"); // for testing purposes
  // check simple dates (month/date - no leading zeroes)
  var n_date = dt_date.getDate();
  var n_month = dt_date.getMonth() + 1;
  var s_year = dt_date.getFullYear();
  var s_day = dt_date.getDay(); // day of the week 0-6

  var s_date0 = (n_month<10?'0':'')+n_month+(n_date<10?'/0':'/')+n_date+'/'+s_year;
  // if (exc && include_holidays && custom_holidays.indexOf(s_date0) > -1)
  //   return false;

  var hdName = default_holiday_name(dt_date);
  if (hdName) { //default holidays
    if (custom_holidays.indexOf(s_date0) > -1)
      return false;
    else
      return hdName;
  }
  if (custom_holidays.indexOf(s_date0) > -1) { //custom holidays
    return 'custom';
  }

  return false;
}

function default_holiday_name (dt_date) {
  var n_date = dt_date.getDate();
  var n_month = dt_date.getMonth() + 1;
  var s_year = dt_date.getFullYear();
  var s_day = dt_date.getDay(); // day of the week 0-6

  var hdName = '';
  var s_date1 = n_month + '/' + n_date;
  if (s_day!=6 && s_day!=0) {
    switch(s_date1){
      case '1/1':
        return "New Year's Day";
      case '7/4':
        return "Independence Day";
      case '11/11':
        return "Veteran's Day";
      case '12/25':
        return "Christmas Day";
      // case GoodFriday(s_year):
        // return "Good Friday";
    }
  }
  // special cases - friday before or monday after weekend holiday
  if (s_day == 5){  // Friday before
    switch(s_date1){
      case '12/31':
        return "New Year's Day";
      case '11/10':
        return "Veteran's Day";
      case '7/3':
        return "Independence Day";
      case '12/24':
        return "Christmas Day";
      }
    }
  if (s_day == 1){  // Monday after
    switch(s_date1){
      case '1/2':
        return "New Year's Day";
      case '11/12':
        return "Veteran's Day";
      case '7/5':
        return "Independence Day";
      case '12/26':
        return "Christmas Day";
      }
    }
  // weekday from beginning of the month (month/num/day)
  var n_wday = dt_date.getDay();
  var n_wnum = Math.floor((n_date - 1) / 7) + 1;
  var s_date2 = n_month + '/' + n_wnum + '/' + n_wday;
  switch(s_date2){
    case '1/3/1':
      return "Martin Luther King Jr Day";
    case '2/3/1':
      return "President's Day";
    case '9/1/1':
      return "Labor Day";
    case '11/4/4':
      return "Thanksgiving Day";
    case '11/4/5':
      return n_date==22 ? false : "Friday after Thanksgiving Day";
    case '11/5/5':
      return n_date==29 ? "Friday after Thanksgiving Day" : false;
    case '10/2/1':
      return "Columbus Day";
    }
  // weekday number from end of the month (month/num/day)
  var dt_temp = new Date (dt_date);
  dt_temp.setDate(1);
  dt_temp.setMonth(dt_temp.getMonth() + 1);
  dt_temp.setDate(dt_temp.getDate() - 1);
  n_wnum = Math.floor((dt_temp.getDate() - n_date - 1) / 7) + 1;
  var s_date3 = n_month + '/' + n_wnum + '/' + n_wday;
  if (   s_date3 == '5/1/1'  // Memorial Day, last Monday in May
  ) return 'Memorial Day';
  if (   s_date3 == '3/1/1'  // Cesar Chavez Day, last Monday in March
  ) return 'Memorial Day';
  return '';
}

function check_exception (dt_date) {
  var n_date = dt_date.getDate();
  var n_month = dt_date.getMonth() + 1;
  var s_year = dt_date.getFullYear();

  var s_date0 = (n_month<10?'0':'')+n_month+(n_date<10?'/0':'/')+n_date+'/'+s_year;
  if (custom_exceptions.indexOf(s_date0) > -1)
    return "Custom Exception";
}

function check_moratorium (dt_date) {
  for (var i = 0; i < morat_ranges.length; i++) {
    if (!morat_ranges[i][0] || !morat_ranges[i][1])
      continue;

    var morat_days = [new Date(morat_ranges[i][0].getTime()), new Date(morat_ranges[i][1].getTime())];
    if (morat_days[0].getTime() > morat_days[1].getTime())
      continue;
    if (!morat_repeat[i]) {
      if (dt_date.getTime() >= morat_days[0].getTime() && dt_date.getTime() <= morat_days[1].getTime())
        return true;
    }
    else {
      var myYear = dt_date.getFullYear();
      var moratd1 = morat_days[0], moratd2 = morat_days[1];
      var diffYear = moratd2.getFullYear() - moratd1.getFullYear();
      moratd1.setFullYear(myYear);
      moratd2.setFullYear(myYear + diffYear);
      if (dt_date.getTime() >= moratd1.getTime() && dt_date.getTime() <= moratd2.getTime())
        return true;
      moratd1.setFullYear(myYear-1);
      moratd2.setFullYear(myYear-1 + diffYear);
      if (dt_date.getTime() >= moratd1.getTime() && dt_date.getTime() <= moratd2.getTime())
        return true;
    }
  }

  return false;
}

function hilite_nonworking(dayOfWeek, dt_date) {
  if (check_holiday(dt_date))
    return (!include_holidays ? "" : "working-") + "holiday";
  if (include_exceptions && check_exception(dt_date))
    return "nonworking";
  if (!work_weekdays[(dayOfWeek-1) % 7])
    return "nonworking";
  if (include_morat && check_moratorium(dt_date))
    return "nonworking";
  return "";
}

function fill_table(year, m_name,m_length,mm) {
  month_length[1] = (year % 4 == 0 ? 29 : 28);

  day=1;
  strCalHtml +="<TABLE BORDER=1 id='tblCalendar'><TR>";
  strCalHtml +="<TD COLSPAN=7><B>" + m_name + "   " + year + "</B><TR>";
  for (var i  = 0; i < weekdays.length; i++)
    day_title(weekdays[i]);
  strCalHtml +="</TR><TR>";
  if (start_day != 8) {
    for (var i=1;i<start_day;i++) {
      strCalHtml +="<TD></TD>";
    }
  }

  for (var i = start_day; i<8; i++) {
    var spcDay = hilite_nonworking(i, new Date(year, mm, day));
    strCalHtml += "<TD class='" + spcDay + "'>";
    strCalHtml += ((spcDay=="holiday" || spcDay=="working-holiday") ? "H" : day) + "</TD>";
    day++;
  }
  strCalHtml +="<TR>";
  var num_rows = (start_day == 8 ? 0 : 1);
  while (day <= m_length) {
    var num_in_row = 0;
    for (var i=1;i<=7 && day<=m_length;i++) {
      var spcDay = hilite_nonworking(i, new Date(year, mm, day));
      strCalHtml += "<TD class='" + spcDay + "'>";
      strCalHtml += ((spcDay=="holiday" || spcDay=="working-holiday") ? "H" : day) + "</TD>";
      day++;
      num_in_row++;
    }
    if (num_in_row < 7) {
      for (var j = 0; j < 7 - num_in_row; j++)
        strCalHtml += "<TD>&nbsp;</TD>";
    }
    strCalHtml +="</TR><TR>";
    num_rows++;
  }
  if (num_rows < 6)
    strCalHtml += "<TD>&nbsp;</TD><TD></TD><TD></TD><TD></TD><TD></TD><TD></TD><TD></TD>";
  if (num_rows < 5)
    strCalHtml += "<TR><TD>&nbsp;</TD><TD></TD><TD></TD><TD></TD><TD></TD><TD></TD><TD></TD>";
  strCalHtml +="</TR></TABLE>";
  start_day = i;
}

function getYearCalHtml(years, ele) {
  console.log(years);
  strCalHtml = "";
  for (var i = 0; i < years.length; i++) {
    var year = years[i];
    strCalHtml += "<p class=h4>" + year + " Project Calendar</p>";
    begin_date = new Date(year, 0, 1);
    start_day = begin_date.getDay()+1;
    if (start_day == 1){
      start_day = 8;
    }

    strCalHtml += "<TABLE><TR>";
    for (var m = 0; m < 12; m++){
      if (m % 3 == 0)
        strCalHtml += "</TR><TR>";
      strCalHtml += "<TD>";
      fill_table(year, month[m], month_length[m], m);
      strCalHtml += "</TD>";
    }
    strCalHtml += "</TABLE>";
    strCalHtml += "<BR>";
  }

  ele.html(strCalHtml);
}
