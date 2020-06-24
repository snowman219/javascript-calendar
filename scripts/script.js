var firstSelectedDate;
var selectedYears = [ new Date().getFullYear() ];
var moratCount = 0;

function fillWorkweekSetting() {
  var strTableHtml  = "<TR>";
  for (var i = 0; i < weekdays.length ; i++)
    strTableHtml += "<TD>" + weekdays[i] + "</TD>";
  strTableHtml += "</TR><TR>";
  for (var i = 0; i < weekdays.length ; i++) {
    strTableHtml += "<TD><input type='checkbox' class='check-workweek' weekday='"+ i + "'"
      + (work_weekdays[i] ? ' checked' : '') + "></TD>";
  }
  strTableHtml += "</TR>";

  $('#tblWorkweek').html(strTableHtml);

  $('.check-workweek').change(function() {
    var weekday = parseInt($(this).attr('weekday')) || 0;
    work_weekdays[weekday] = $(this).is(':checked') ? 1 : 0;
    getYearCalHtml(selectedYears, $('#divCal'));
  });
}

function toggleExceptions() {
  var isChecked = $(this).is(':checked');
  switch ($(this).attr('id')) {
    case 'chkHoliYes':
      include_holidays = isChecked;
      $('#chkHoliNo').prop('checked', !include_holidays);
      break;
    case 'chkHoliNo':
      include_holidays = !isChecked;
      $('#chkHoliYes').prop('checked', include_holidays);
      break;
    case 'chkExcpYes':
      include_exceptions = isChecked;
      $('#chkExcpNo').prop('checked', !include_exceptions);
      break;
    case 'chkExcpNo':
      include_exceptions = !isChecked;
      $('#chkExcpYes').prop('checked', include_exceptions);
      break;
    case 'chkMoratYes':
      include_morat = isChecked;
      $('#chkMoratNo').prop('checked', !include_morat);
      $('#divMoratOptions').toggle(include_morat);
      break;
    case 'chkMoratNo':
      include_morat = !isChecked;
      $('#chkMoratYes').prop('checked', include_morat);
      $('#divMoratOptions').toggle(include_morat);
      break;
    default:
      break;
  }

  getYearCalHtml(selectedYears, $('#divCal'));
}

function openExceptionPickers() {
  var holiPicker  = $('#dpHolidays').multiDatesPicker({showOn: 'button', buttonText: 'Customize'});
  holiPicker.multiDatesPicker({
    onSelect: function(dateText) {
      custom_holidays = $('#dpHolidays').val().split(', ');
      getYearCalHtml(selectedYears, $('#divCal'));
    },
    beforeShowDay: function(date) {
      var highlight = default_holiday_name(date);
      if (highlight) {
        return [true, "holid", highlight];
      } else {
        return [true, '', ''];
      }
    }
  });

  var excpPicker  = $('#dpExceptions').multiDatesPicker({showOn: 'button', buttonText: 'Customize'});
  excpPicker.multiDatesPicker({
    onSelect: function(dateText) {
      custom_exceptions = $('#dpExceptions').val().split(', ');
      getYearCalHtml(selectedYears, $('#divCal'));
    }
  });
}

function resetCalendar() {
  $('#txtProjName').val('');
  $('#txtProjDur').val('');
  $('.num-alert').hide();
  $('.name-alert').hide();
  $('#txtProjID').val('');
  $('#dpStartDate').val(firstSelectedDate);

  work_weekdays = [0,1,1,1,1,1,0];
  fillWorkweekSetting();

  $('#chkHoliYes').prop('checked', false);
  $('#chkHoliNo').prop('checked', true);
  $('#chkExcpYes').prop('checked', false);
  $('#chkExcpNo').prop('checked', true);
  $('#chkMoratYes').prop('checked', false);
  $('#chkMoratNo').prop('checked', true);

  include_holidays = false;
  custom_holidays = [];
  $('#dpHolidays').val('');
  include_exceptions = false;
  custom_exceptions = [];
  $('#dpExceptions').val('');
  include_morat = false;
  for (var i = 0; i < 10; i++) {
    morat_ranges[i] = [null, null];
    morat_repeat[i] = false;
    $("input[rng-num='"+i+"_0']").val('');
    $("input[rng-num='"+i+"_1']").val('');
    $(".rngchk[rng-num='"+i+"']").prop('checked', false);
    $("div[rng-num='"+(i+1)+"']").hide();
  }
  moratCount = 0;
  $('#divMoratOptions').hide();

  selectedYears = [ new Date().getFullYear() ];
  getYearCalHtml(selectedYears, $('#divCal'));
}

function submitCalendar () {
  $('#printProjName').html($('#txtProjName').val());
  $('#printProjID').html("PROJECT ID NO: " + $('#txtProjID').val());
  $('#printCalTable').html($('#divCal').html());
}

Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}

function getYearsList() {
  selectedYears = [];
  var startDate = $('#dpStartDate').datepicker("getDate");
  var projDuration = parseInt($('#txtProjDur').val()) || 0;
  var endDate = startDate.addDays(projDuration);
  for (var i = startDate.getFullYear(); i <= endDate.getFullYear(); i++)
    selectedYears.push(i);
}

function fillMoratOptions() {
  morat_ranges = [];
  var strMoratHtml = "";
  for (var i = 0; i < 10; i++) {
    strMoratHtml += "<div rng-num='" + i
      + "'><button type='button' class='btn btn-xs btn-default del-morat' rng-num='"
      + i + "'><span class='glyphicon glyphicon-minus'></span>"
      + "</button>Start: <input type='text' class=rngdp rng-num='"
      + i + "_0'>Finish: <input type='text' class='rngdp' rng-num='"
      + i + "_1'>&emsp;&emsp; Repeat Annually: <input type='checkbox' class='rngchk' rng-num='"
      + i + "'></div>";
    morat_ranges[i] = [null, null];
    morat_repeat[i] = false;
  }
  $('#divMoratOptions').html(strMoratHtml + $('#divMoratOptions').html());
  $('#divMoratOptions').hide();

  for (var i = 1; i < 10; i++)
    $("div[rng-num='"+i+"']").hide();

  $('#divMoratOptions .rngdp').datepicker()
    .on('change', function(e){
      var rngs = $(this).attr('rng-num').split('_');
      morat_ranges[parseInt(rngs[0])][parseInt(rngs[1])] = $(this).datepicker('getDate');

      var date1 = $("input[rng-num='"+rngs[0]+"_0']").datepicker('getDate');
      var date2 = $("input[rng-num='"+rngs[0]+"_1']").datepicker('getDate');
      if (!include_morat)
        return;
      if (!date1 || !date2)
        return;
      if (date1.getTime() > date2.getTime())
        return;
      getYearCalHtml(selectedYears, $('#divCal'));
    });

  $('#divMoratOptions .rngchk').click(function(){
    var rngNum = parseInt($(this).attr('rng-num'));
    morat_repeat[rngNum] = $(this).is(':checked');
    var date1 = $("input[rng-num='"+rngNum+"_0']").datepicker('getDate');
    var date2 = $("input[rng-num='"+rngNum+"_1']").datepicker('getDate');
    if (!include_morat)
      return;
    if (!date1 || !date2)
      return;
    if (date1.getTime() > date2.getTime())
      return;
    getYearCalHtml(selectedYears, $('#divCal'));
  });

  $('#addMorat').click(function() {
    console.log(moratCount);
    if (moratCount > 7)
      $(this).hide();
    if (moratCount > 8)
      return;

    moratCount++;
    $("div[rng-num='"+moratCount+"']").show();
  });

  $('.del-morat').click(function() {
    var rngNum = parseInt($(this).attr('rng-num'));
    for (var i = rngNum+1; i <= moratCount; i++) {
      $("input[rng-num='"+(i-1)+"_0']").val($("input[rng-num='"+i+"_0']").val());
      $("input[rng-num='"+(i-1)+"_1']").val($("input[rng-num='"+i+"_1']").val());
      if (!morat_ranges[i][0])
        morat_ranges[i-1][0] = null;
      else
        morat_ranges[i-1][0] = new Date(morat_ranges[i][0].getTime());
      if (!morat_ranges[i][1])
        morat_ranges[i-1][1] = null;
      else
        morat_ranges[i-1][1] = new Date(morat_ranges[i][1].getTime());

      $(".rngchk[rng-num='"+(i-1)+"']").prop('checked', $(".rngchk[rng-num='"+i+"']").is(':checked'));
      morat_repeat[i-1] = morat_repeat[i];
    }

    morat_ranges[moratCount][0] = null;
    morat_ranges[moratCount][1] = null;
    $("input[rng-num='"+moratCount+"_0']").val('');
    $("input[rng-num='"+moratCount+"_1']").val('');
    $(".rngchk[rng-num='"+moratCount+"']").prop('checked', false);
    $("div[rng-num='"+moratCount+"']").hide();
    morat_repeat[moratCount] = false;
    moratCount--;

    getYearCalHtml(selectedYears, $('#divCal'));
  });
}

function exportToPdf() {
  var doc = new jsPDF({orientation: 'p',
    unit: 'pt',
    format: 'a4'});
  var docMargin = {
    left: 35,
    top: 120,
  }
  var cellWidth = 25, cellHeight = 20;

  var ele = $("#printCalTable>table");
  for (var tblNo = 0; tblNo < ele.length; tblNo++) {
    var tbljson = mapDOM(ele[tblNo], true);
    tbljson = tbljson['content'][0]['content'];

    doc.setFontSize(18);
    doc.setFontType("bold");
    doc.text(200, 50, selectedYears[tblNo] + ' Project Calendar');

    doc.setFontType("regular");
    doc.setFontSize(17);
    doc.setFontType("regular");
    var splitTitle = doc.splitTextToSize($('#txtProjName').val().toUpperCase(), 525);

    var nameTop = splitTitle.length == 1 ? 90 : 75;
    doc.text(docMargin.left, nameTop, splitTitle);
    // doc.text(docMargin.left, 60, $('#txtProjName').val());
    doc.setFontSize(13);
    doc.setFontType("regular");
    nameTop = splitTitle.length == 1 ? 110 : 113;
    doc.text(docMargin.left, nameTop, "PROJECT ID NO: " + $('#txtProjID').val().toUpperCase());



    for (var i = 0 ; i < 22; i++) {
      doc.setLineWidth(i % 7 == 0 ? 2 : 1);
      doc.line(docMargin.left + cellWidth*i, docMargin.top, docMargin.left + cellWidth*i, docMargin.top + cellHeight * 32);
    }
    for (var i = 0 ; i < 33; i++) {
      doc.setLineWidth(i % 8 == 0 ? 2 : 1);
      doc.line(docMargin.left, docMargin.top+cellHeight*i, docMargin.left+cellWidth*21, docMargin.top + cellHeight * i);
    }

    for (var i = 1; i<5; i++) {

      var cont3tbl = tbljson[i]['content'];
      for (var j=0; j<3; j++){//months in a row
        if (!cont3tbl[j]['content']) continue;
        var d1 = cont3tbl[j]['content'][0]['content'][0]['content'];
        var m1 = 0;
        for (var k=0; k<d1.length; k++) {
          var d2 = d1[k]['content']; //weeks of a month
          if (!d2)  {
            m1++;
            continue;
          }
          for (var l = 0; l<d2.length; l++) {
            if (!d2[l]['content']) continue;
            doc.setFontSize(12);
            var cont = d2[l]['content'][0]; //day in a week
            var startX = docMargin.left+cellWidth*(j*7+l), startY = docMargin.top+cellHeight*((i-1)*8+k-m1);

            if (cont['content']) {
              cont = cont['content'][0];
              doc.setDrawColor(0,0,0);
              doc.setFillColor(255,255,255);
              doc.rect(startX+2, startY+1, cellWidth*7-3, cellHeight-1.5, 'F');
            }
            if (d2[l]['attributes'] && d2[l]['attributes']['class']) {
              if (d2[l]['attributes']['class'] == 'nonworking') {
                doc.setFillColor(187,187,187);
                doc.rect(startX+1, startY+1, cellWidth-2, cellHeight-1.5, 'F');
              }
              if (d2[l]['attributes']['class'] == 'holiday') {
                doc.setFillColor(187,187,187);
                doc.rect(startX+1, startY+1, cellWidth-2, cellHeight-1.5, 'F');
              }

            }

            var textOffsetX = cont.length <=2 ? 12 - 3 * cont.length : 6;
            if (!parseInt(cont))
              doc.setFontType("bold");
            else
              doc.setFontType("regular");
            doc.text(startX+textOffsetX, startY+cellHeight-6, cont);
          }
        }
      }
    }

    doc.setFontSize(14);
    doc.setLineWidth(1);
    doc.setFillColor(255,255,255);
    doc.setDrawColor(0,0,0);
    doc.rect(50, 770, 25, 20, 'FD');
    doc.text(80, 785, "= Work Allowed");
    doc.setFillColor(187,187,187);
    doc.setDrawColor(0,0,0);
    doc.rect(220, 770, 25, 20, 'FD');
    doc.text(255, 785, "= No Work Allowed");
    doc.text(409, 785, "H");
    doc.text(426, 785, "= Holiday");

    if (tblNo != ele.length-1)
      doc.addPage();
  }
  doc.save('cal.pdf');
}

function mapDOM(element, json) {
    var treeObject = {};

    // If string convert to document Node
    if (typeof element === "string") {
        if (window.DOMParser) {
              parser = new DOMParser();
              docNode = parser.parseFromString(element,"text/xml");
        } else { // Microsoft strikes again
              docNode = new ActiveXObject("Microsoft.XMLDOM");
              docNode.async = false;
              docNode.loadXML(element);
        }
        element = docNode.firstChild;
    }

    //Recursively loop through DOM elements and assign properties to object
    function treeHTML(element, object) {
        object["type"] = element.nodeName;
        var nodeList = element.childNodes;
        if (nodeList != null) {
            if (nodeList.length) {
                object["content"] = [];
                for (var i = 0; i < nodeList.length; i++) {
                    if (nodeList[i].nodeType == 3) {
                        object["content"].push(nodeList[i].nodeValue);
                    } else {
                        object["content"].push({});
                        treeHTML(nodeList[i], object["content"][object["content"].length -1]);
                    }
                }
            }
        }
        if (element.attributes != null) {
            if (element.attributes.length) {
                object["attributes"] = {};
                for (var i = 0; i < element.attributes.length; i++) {
                    object["attributes"][element.attributes[i].nodeName] = element.attributes[i].nodeValue;
                }
            }
        }
    }
    treeHTML(element, treeObject);

    return treeObject;
}

$(document).ready(function(){

  fillWorkweekSetting();
  $('#dpStartDate').datepicker({dateFormat: 'MM d, yy' })
    .datepicker("setDate", new Date())
    .on('change', function(e) {
      getYearsList();
      getYearCalHtml(selectedYears, $('#divCal'));
    });
  firstSelectedDate = $('#dpStartDate').val();

  var delay = (function(){
    var timer = 0;
    return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
   };
  })();

  $('#txtProjName').on('keyup', function(){
    var nameLength = $('#txtProjName').val().length;
    if (nameLength >= 120) {
      $('.name-alert').show();
      $('#txtProjName').val($('#txtProjName').val().substr(0, 120));
    }
    else {
      $('.name-alert').hide();
    }
  });

  $('#txtProjDur').on('keyup', function(){
    delay(function(){
      var duration = parseInt($('#txtProjDur').val());
      if (duration < 1 || duration > 1000 || !duration) {
        $('.num-alert').show();
        return;
      }
      else {
        $('.num-alert').hide();
        getYearsList();
        getYearCalHtml(selectedYears, $('#divCal'));
      }
    }, 1000 );
  });

  $('#chkHoliNo').prop('checked', true);
  $('#chkExcpNo').prop('checked', true);
  $('#chkMoratNo').prop('checked', true);
  $('#chkHoliYes').click(toggleExceptions);
  $('#chkHoliNo').click(toggleExceptions);
  $('#chkExcpYes').click(toggleExceptions);
  $('#chkExcpNo').click(toggleExceptions);
  $('#chkMoratYes').click(toggleExceptions);
  $('#chkMoratNo').click(toggleExceptions);

  openExceptionPickers();
  fillMoratOptions();

  $('#btnReset').click(resetCalendar);
  $('#btnSubmit').click(submitCalendar);

  getYearCalHtml(selectedYears, $('#divCal'));

  $('#btnPrint').click(exportToPdf);
});
