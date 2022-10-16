const ticketReservationApp = {
	elements: {
		route: document.getElementById("route"),
		timeA: document.getElementById("timeA"),
		timeB: document.getElementById("timeB"),
		num: document.getElementById("num"),
		resultBtn: document.getElementById("result"),
		info: document.getElementById("info"),
	},
	prices: {
		"A-B": 700,
		"B-A": 700,
		"A-B-A": 1200,
	},
	travelTime: 50,
	timeZone: "+03:00",
};

const order = {
	route: "A-B",
	amount: 1,
	startPosition: [],
	departureTimes: [],
	date: {
		year: "2022",
		month: "August",
		date: "21",
	},
};

ticketReservationApp.elements.route.addEventListener("input", function () {
	formReset(3);

	order.route = ticketReservationApp.elements.route.value;

	if (order.route === "A-B") {
		order.startPosition.push(["A", "B"]);
	} else if (order.route === "B-A") {
		order.startPosition.push(["B", "A"]);
	} else if (order.route === "A-B-A") {
		order.startPosition.push(["A", "B"], ["B", "A"]);
	}

	if (order.startPosition[0][0] === "A") {
		ticketReservationApp.elements.timeA.removeAttribute("disabled");
	} else if (order.startPosition[0][0] === "B") {
		ticketReservationApp.elements.timeB.removeAttribute("disabled");
	}
});

ticketReservationApp.elements.timeA.addEventListener("input", function () {
	formReset(2);

	order.departureTimes.push(getNewDate(ticketReservationApp.elements.timeA.value, ticketReservationApp.timeZone));

	if (order.startPosition.length > 1) {
		ticketReservationApp.elements.timeB.removeAttribute("disabled");

		let timeBoptions = ticketReservationApp.elements.timeB.getElementsByTagName("option");

		let arrivalTime = new Date(order.departureTimes[0].getTime());
		arrivalTime.setMinutes(arrivalTime.getMinutes() + ticketReservationApp.travelTime);

		for (let i = 1; i < timeBoptions.length; i++) {
			if (arrivalTime > getNewDate(timeBoptions[i].value, ticketReservationApp.timeZone)) {
				timeBoptions[i].style.display = "none";
			}
		}
	} else {
		ticketReservationApp.elements.num.removeAttribute("disabled");
		ticketReservationApp.elements.resultBtn.removeAttribute("disabled");
	}
});

ticketReservationApp.elements.timeB.addEventListener("input", function () {
	formReset(1);

	order.departureTimes.push(getNewDate(ticketReservationApp.elements.timeB.value, ticketReservationApp.timeZone));

	ticketReservationApp.elements.num.removeAttribute("disabled");
	ticketReservationApp.elements.resultBtn.removeAttribute("disabled");
});

ticketReservationApp.elements.num.addEventListener("input", function () {
	formReset(0);

	if (ticketReservationApp.elements.num.value < 1) {
		ticketReservationApp.elements.resultBtn.setAttribute("disabled", "true");
	} else {
		ticketReservationApp.elements.resultBtn.removeAttribute("disabled");
	}

	order.amount = ticketReservationApp.elements.num.value;
});

ticketReservationApp.elements.resultBtn.onclick = function () {
	event.preventDefault();

	let p1Text = "";
	let totalPrice = order.amount * ticketReservationApp.prices[order.route];
	let routeText = "";
	for (let i = 0; i < order.startPosition.length; i++) {
		if (i === 0) {
			routeText += order.startPosition[i][0] + " - " + order.startPosition[i][1];
		} else {
			routeText += " - " + order.startPosition[i][1];
		}
	}
	p1Text = "<p>Выбрано билетов: " + order.amount + ". Ваш маршрут: " + routeText + ". Общая стоимость: " + totalPrice + " р.</p>";

	let p2Text = "";
	let shipTime = order.startPosition.length * ticketReservationApp.travelTime;
	p2Text = "<p>Время, которое Вы проведете на теплоходе: " + getTimeText(shipTime) + "</p>";

	let p3Text = "";
	let totalTime;
	if (order.startPosition.length > 1) {
		totalTime = getInterval(order.departureTimes[0], order.departureTimes[1]).minutes + ticketReservationApp.travelTime;
		p3Text = "<p>Сумарное время вашего путешествия: " + getTimeText(totalTime) + "</p>";
	}

	let p4Text = "";
	let restTime;
	if (order.startPosition.length > 1) {
		restTime = totalTime - shipTime;
		p4Text = "<p>Время на прогулку: " + getTimeText(restTime) + "</p>";
	}

	let p5Text = "";
	let arrivalTime;
	if (order.startPosition.length > 1) {
		for (let i = 0; i < order.startPosition.length; i++) {
			arrivalTime = new Date(order.departureTimes[i].getTime());
			arrivalTime.setMinutes(arrivalTime.getMinutes() + ticketReservationApp.travelTime);

			p5Text +=
				"<p>Теплоход отправляется из " +
				order.startPosition[i][0] +
				" в " +
				(("0" + order.departureTimes[i].getHours()).slice(-2) + ":" + ("0" + order.departureTimes[i].getMinutes()).slice(-2)) +
				" и прибывает в " +
				order.startPosition[i][1] +
				" в " +
				(("0" + arrivalTime.getHours()).slice(-2) + ":" + ("0" + arrivalTime.getMinutes()).slice(-2)) +
				".</p>";
		}
	} else {
		arrivalTime = new Date(order.departureTimes[0].getTime());
		arrivalTime.setMinutes(arrivalTime.getMinutes() + ticketReservationApp.travelTime);

		p5Text =
			"<p>Теплоход отправляется из " +
			order.startPosition[0][0] +
			" в " +
			(("0" + order.departureTimes[0].getHours()).slice(-2) + ":" + ("0" + order.departureTimes[0].getMinutes()).slice(-2)) +
			" и прибывает в " +
			order.startPosition[0][1] +
			" в " +
			(("0" + arrivalTime.getHours()).slice(-2) + ":" + ("0" + arrivalTime.getMinutes()).slice(-2)) +
			".</p>";
	}

	ticketReservationApp.elements.info.innerHTML = p1Text + p2Text + p3Text + p4Text + p5Text;
};

function getTimeText(totalMinutes) {
	if (totalMinutes === 0) {
		return 0;
	}

	let timeText = "";
	if (totalMinutes > 60) {
		timeText += Math.floor(totalMinutes / 60) + " ч. ";
	}
	if (totalMinutes % 60 > 0) {
		timeText += (totalMinutes % 60) + " мин.";
	}

	return timeText;
}

function formReset(number) {
	if (number >= 3) {
		ticketReservationApp.elements.timeA.setAttribute("disabled", "true");
		ticketReservationApp.elements.timeA.value = null;
		order.startPosition.length = 0;
	}

	if (number >= 2) {
		ticketReservationApp.elements.timeB.setAttribute("disabled", "true");
		ticketReservationApp.elements.timeB.value = null;
		order.departureTimes.length = 0;

		let timeBoptions = ticketReservationApp.elements.timeB.getElementsByTagName("option");

		for (let i = 1; i < timeBoptions.length; i++) {
			timeBoptions[i].removeAttribute("style");
		}
	}

	if (number >= 1) {
		ticketReservationApp.elements.num.setAttribute("disabled", "true");
		ticketReservationApp.elements.num.value = 1;
		order.amount = 1;
		ticketReservationApp.elements.resultBtn.setAttribute("disabled", "true");

		if (order.departureTimes.length > 1) {
			order.departureTimes.pop();
		}
	}

	if (number >= 0) {
		ticketReservationApp.elements.info.textContent = "";
	}
}

function getNewDate(time, timeZone) {
	let date = new Date(order.date.month + " " + order.date.date + ", " + order.date.year + " " + time + " " + timeZone);
	return date;
}

function convertTime() {
	let timeAoptions = ticketReservationApp.elements.timeA.getElementsByTagName("option");
	for (let i = 1; i < timeAoptions.length; i++) {
		let newTime =
			("0" + getNewDate(timeAoptions[i].value, ticketReservationApp.timeZone).getHours()).slice(-2) +
			":" +
			("0" + getNewDate(timeAoptions[i].value, ticketReservationApp.timeZone).getMinutes()).slice(-2);
		// timeAoptions[i].value = newTime;
		timeAoptions[i].textContent = newTime;
	}

	let timeBoptions = ticketReservationApp.elements.timeB.getElementsByTagName("option");
	for (let i = 1; i < timeBoptions.length; i++) {
		let newTime =
			("0" + getNewDate(timeBoptions[i].value, ticketReservationApp.timeZone).getHours()).slice(-2) +
			":" +
			("0" + getNewDate(timeBoptions[i].value, ticketReservationApp.timeZone).getMinutes()).slice(-2);
		// timeBoptions[i].value = newTime;
		timeBoptions[i].textContent = newTime;
	}
}

function getInterval(start, end) {
	let interval = end - start;
	let seconds = Math.round(interval / 1000);
	let minutes = Math.round(seconds / 60);
	let hours = Math.round(minutes / 60);
	let days = Math.round(hours / 24);

	return {
		days: days,
		hours: hours,
		minutes: minutes,
		seconds: seconds,
	};
}

convertTime();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY3JpcHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdGlja2V0UmVzZXJ2YXRpb25BcHAgPSB7XHJcblx0ZWxlbWVudHM6IHtcclxuXHRcdHJvdXRlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvdXRlXCIpLFxyXG5cdFx0dGltZUE6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGltZUFcIiksXHJcblx0XHR0aW1lQjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aW1lQlwiKSxcclxuXHRcdG51bTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJudW1cIiksXHJcblx0XHRyZXN1bHRCdG46IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdWx0XCIpLFxyXG5cdFx0aW5mbzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbmZvXCIpLFxyXG5cdH0sXHJcblx0cHJpY2VzOiB7XHJcblx0XHRcIkEtQlwiOiA3MDAsXHJcblx0XHRcIkItQVwiOiA3MDAsXHJcblx0XHRcIkEtQi1BXCI6IDEyMDAsXHJcblx0fSxcclxuXHR0cmF2ZWxUaW1lOiA1MCxcclxuXHR0aW1lWm9uZTogXCIrMDM6MDBcIixcclxufTtcclxuXHJcbmNvbnN0IG9yZGVyID0ge1xyXG5cdHJvdXRlOiBcIkEtQlwiLFxyXG5cdGFtb3VudDogMSxcclxuXHRzdGFydFBvc2l0aW9uOiBbXSxcclxuXHRkZXBhcnR1cmVUaW1lczogW10sXHJcblx0ZGF0ZToge1xyXG5cdFx0eWVhcjogXCIyMDIyXCIsXHJcblx0XHRtb250aDogXCJBdWd1c3RcIixcclxuXHRcdGRhdGU6IFwiMjFcIixcclxuXHR9LFxyXG59O1xyXG5cclxudGlja2V0UmVzZXJ2YXRpb25BcHAuZWxlbWVudHMucm91dGUuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGZ1bmN0aW9uICgpIHtcclxuXHRmb3JtUmVzZXQoMyk7XHJcblxyXG5cdG9yZGVyLnJvdXRlID0gdGlja2V0UmVzZXJ2YXRpb25BcHAuZWxlbWVudHMucm91dGUudmFsdWU7XHJcblxyXG5cdGlmIChvcmRlci5yb3V0ZSA9PT0gXCJBLUJcIikge1xyXG5cdFx0b3JkZXIuc3RhcnRQb3NpdGlvbi5wdXNoKFtcIkFcIiwgXCJCXCJdKTtcclxuXHR9IGVsc2UgaWYgKG9yZGVyLnJvdXRlID09PSBcIkItQVwiKSB7XHJcblx0XHRvcmRlci5zdGFydFBvc2l0aW9uLnB1c2goW1wiQlwiLCBcIkFcIl0pO1xyXG5cdH0gZWxzZSBpZiAob3JkZXIucm91dGUgPT09IFwiQS1CLUFcIikge1xyXG5cdFx0b3JkZXIuc3RhcnRQb3NpdGlvbi5wdXNoKFtcIkFcIiwgXCJCXCJdLCBbXCJCXCIsIFwiQVwiXSk7XHJcblx0fVxyXG5cclxuXHRpZiAob3JkZXIuc3RhcnRQb3NpdGlvblswXVswXSA9PT0gXCJBXCIpIHtcclxuXHRcdHRpY2tldFJlc2VydmF0aW9uQXBwLmVsZW1lbnRzLnRpbWVBLnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xyXG5cdH0gZWxzZSBpZiAob3JkZXIuc3RhcnRQb3NpdGlvblswXVswXSA9PT0gXCJCXCIpIHtcclxuXHRcdHRpY2tldFJlc2VydmF0aW9uQXBwLmVsZW1lbnRzLnRpbWVCLnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xyXG5cdH1cclxufSk7XHJcblxyXG50aWNrZXRSZXNlcnZhdGlvbkFwcC5lbGVtZW50cy50aW1lQS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgZnVuY3Rpb24gKCkge1xyXG5cdGZvcm1SZXNldCgyKTtcclxuXHJcblx0b3JkZXIuZGVwYXJ0dXJlVGltZXMucHVzaChnZXROZXdEYXRlKHRpY2tldFJlc2VydmF0aW9uQXBwLmVsZW1lbnRzLnRpbWVBLnZhbHVlLCB0aWNrZXRSZXNlcnZhdGlvbkFwcC50aW1lWm9uZSkpO1xyXG5cclxuXHRpZiAob3JkZXIuc3RhcnRQb3NpdGlvbi5sZW5ndGggPiAxKSB7XHJcblx0XHR0aWNrZXRSZXNlcnZhdGlvbkFwcC5lbGVtZW50cy50aW1lQi5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcclxuXHJcblx0XHRsZXQgdGltZUJvcHRpb25zID0gdGlja2V0UmVzZXJ2YXRpb25BcHAuZWxlbWVudHMudGltZUIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRpb25cIik7XHJcblxyXG5cdFx0bGV0IGFycml2YWxUaW1lID0gbmV3IERhdGUob3JkZXIuZGVwYXJ0dXJlVGltZXNbMF0uZ2V0VGltZSgpKTtcclxuXHRcdGFycml2YWxUaW1lLnNldE1pbnV0ZXMoYXJyaXZhbFRpbWUuZ2V0TWludXRlcygpICsgdGlja2V0UmVzZXJ2YXRpb25BcHAudHJhdmVsVGltZSk7XHJcblxyXG5cdFx0Zm9yIChsZXQgaSA9IDE7IGkgPCB0aW1lQm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0aWYgKGFycml2YWxUaW1lID4gZ2V0TmV3RGF0ZSh0aW1lQm9wdGlvbnNbaV0udmFsdWUsIHRpY2tldFJlc2VydmF0aW9uQXBwLnRpbWVab25lKSkge1xyXG5cdFx0XHRcdHRpbWVCb3B0aW9uc1tpXS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9IGVsc2Uge1xyXG5cdFx0dGlja2V0UmVzZXJ2YXRpb25BcHAuZWxlbWVudHMubnVtLnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xyXG5cdFx0dGlja2V0UmVzZXJ2YXRpb25BcHAuZWxlbWVudHMucmVzdWx0QnRuLnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xyXG5cdH1cclxufSk7XHJcblxyXG50aWNrZXRSZXNlcnZhdGlvbkFwcC5lbGVtZW50cy50aW1lQi5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgZnVuY3Rpb24gKCkge1xyXG5cdGZvcm1SZXNldCgxKTtcclxuXHJcblx0b3JkZXIuZGVwYXJ0dXJlVGltZXMucHVzaChnZXROZXdEYXRlKHRpY2tldFJlc2VydmF0aW9uQXBwLmVsZW1lbnRzLnRpbWVCLnZhbHVlLCB0aWNrZXRSZXNlcnZhdGlvbkFwcC50aW1lWm9uZSkpO1xyXG5cclxuXHR0aWNrZXRSZXNlcnZhdGlvbkFwcC5lbGVtZW50cy5udW0ucmVtb3ZlQXR0cmlidXRlKFwiZGlzYWJsZWRcIik7XHJcblx0dGlja2V0UmVzZXJ2YXRpb25BcHAuZWxlbWVudHMucmVzdWx0QnRuLnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xyXG59KTtcclxuXHJcbnRpY2tldFJlc2VydmF0aW9uQXBwLmVsZW1lbnRzLm51bS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgZnVuY3Rpb24gKCkge1xyXG5cdGZvcm1SZXNldCgwKTtcclxuXHJcblx0aWYgKHRpY2tldFJlc2VydmF0aW9uQXBwLmVsZW1lbnRzLm51bS52YWx1ZSA8IDEpIHtcclxuXHRcdHRpY2tldFJlc2VydmF0aW9uQXBwLmVsZW1lbnRzLnJlc3VsdEJ0bi5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcInRydWVcIik7XHJcblx0fSBlbHNlIHtcclxuXHRcdHRpY2tldFJlc2VydmF0aW9uQXBwLmVsZW1lbnRzLnJlc3VsdEJ0bi5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcclxuXHR9XHJcblxyXG5cdG9yZGVyLmFtb3VudCA9IHRpY2tldFJlc2VydmF0aW9uQXBwLmVsZW1lbnRzLm51bS52YWx1ZTtcclxufSk7XHJcblxyXG50aWNrZXRSZXNlcnZhdGlvbkFwcC5lbGVtZW50cy5yZXN1bHRCdG4ub25jbGljayA9IGZ1bmN0aW9uICgpIHtcclxuXHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRsZXQgcDFUZXh0ID0gXCJcIjtcclxuXHRsZXQgdG90YWxQcmljZSA9IG9yZGVyLmFtb3VudCAqIHRpY2tldFJlc2VydmF0aW9uQXBwLnByaWNlc1tvcmRlci5yb3V0ZV07XHJcblx0bGV0IHJvdXRlVGV4dCA9IFwiXCI7XHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlci5zdGFydFBvc2l0aW9uLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRpZiAoaSA9PT0gMCkge1xyXG5cdFx0XHRyb3V0ZVRleHQgKz0gb3JkZXIuc3RhcnRQb3NpdGlvbltpXVswXSArIFwiIC0gXCIgKyBvcmRlci5zdGFydFBvc2l0aW9uW2ldWzFdO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cm91dGVUZXh0ICs9IFwiIC0gXCIgKyBvcmRlci5zdGFydFBvc2l0aW9uW2ldWzFdO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRwMVRleHQgPSBcIjxwPtCS0YvQsdGA0LDQvdC+INCx0LjQu9C10YLQvtCyOiBcIiArIG9yZGVyLmFtb3VudCArIFwiLiDQktCw0Ygg0LzQsNGA0YjRgNGD0YI6IFwiICsgcm91dGVUZXh0ICsgXCIuINCe0LHRidCw0Y8g0YHRgtC+0LjQvNC+0YHRgtGMOiBcIiArIHRvdGFsUHJpY2UgKyBcIiDRgC48L3A+XCI7XHJcblxyXG5cdGxldCBwMlRleHQgPSBcIlwiO1xyXG5cdGxldCBzaGlwVGltZSA9IG9yZGVyLnN0YXJ0UG9zaXRpb24ubGVuZ3RoICogdGlja2V0UmVzZXJ2YXRpb25BcHAudHJhdmVsVGltZTtcclxuXHRwMlRleHQgPSBcIjxwPtCS0YDQtdC80Y8sINC60L7RgtC+0YDQvtC1INCS0Ysg0L/RgNC+0LLQtdC00LXRgtC1INC90LAg0YLQtdC/0LvQvtGF0L7QtNC1OiBcIiArIGdldFRpbWVUZXh0KHNoaXBUaW1lKSArIFwiPC9wPlwiO1xyXG5cclxuXHRsZXQgcDNUZXh0ID0gXCJcIjtcclxuXHRsZXQgdG90YWxUaW1lO1xyXG5cdGlmIChvcmRlci5zdGFydFBvc2l0aW9uLmxlbmd0aCA+IDEpIHtcclxuXHRcdHRvdGFsVGltZSA9IGdldEludGVydmFsKG9yZGVyLmRlcGFydHVyZVRpbWVzWzBdLCBvcmRlci5kZXBhcnR1cmVUaW1lc1sxXSkubWludXRlcyArIHRpY2tldFJlc2VydmF0aW9uQXBwLnRyYXZlbFRpbWU7XHJcblx0XHRwM1RleHQgPSBcIjxwPtCh0YPQvNCw0YDQvdC+0LUg0LLRgNC10LzRjyDQstCw0YjQtdCz0L4g0L/Rg9GC0LXRiNC10YHRgtCy0LjRjzogXCIgKyBnZXRUaW1lVGV4dCh0b3RhbFRpbWUpICsgXCI8L3A+XCI7XHJcblx0fVxyXG5cclxuXHRsZXQgcDRUZXh0ID0gXCJcIjtcclxuXHRsZXQgcmVzdFRpbWU7XHJcblx0aWYgKG9yZGVyLnN0YXJ0UG9zaXRpb24ubGVuZ3RoID4gMSkge1xyXG5cdFx0cmVzdFRpbWUgPSB0b3RhbFRpbWUgLSBzaGlwVGltZTtcclxuXHRcdHA0VGV4dCA9IFwiPHA+0JLRgNC10LzRjyDQvdCwINC/0YDQvtCz0YPQu9C60YM6IFwiICsgZ2V0VGltZVRleHQocmVzdFRpbWUpICsgXCI8L3A+XCI7XHJcblx0fVxyXG5cclxuXHRsZXQgcDVUZXh0ID0gXCJcIjtcclxuXHRsZXQgYXJyaXZhbFRpbWU7XHJcblx0aWYgKG9yZGVyLnN0YXJ0UG9zaXRpb24ubGVuZ3RoID4gMSkge1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBvcmRlci5zdGFydFBvc2l0aW9uLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGFycml2YWxUaW1lID0gbmV3IERhdGUob3JkZXIuZGVwYXJ0dXJlVGltZXNbaV0uZ2V0VGltZSgpKTtcclxuXHRcdFx0YXJyaXZhbFRpbWUuc2V0TWludXRlcyhhcnJpdmFsVGltZS5nZXRNaW51dGVzKCkgKyB0aWNrZXRSZXNlcnZhdGlvbkFwcC50cmF2ZWxUaW1lKTtcclxuXHJcblx0XHRcdHA1VGV4dCArPVxyXG5cdFx0XHRcdFwiPHA+0KLQtdC/0LvQvtGF0L7QtCDQvtGC0L/RgNCw0LLQu9GP0LXRgtGB0Y8g0LjQtyBcIiArXHJcblx0XHRcdFx0b3JkZXIuc3RhcnRQb3NpdGlvbltpXVswXSArXHJcblx0XHRcdFx0XCIg0LIgXCIgK1xyXG5cdFx0XHRcdCgoXCIwXCIgKyBvcmRlci5kZXBhcnR1cmVUaW1lc1tpXS5nZXRIb3VycygpKS5zbGljZSgtMikgKyBcIjpcIiArIChcIjBcIiArIG9yZGVyLmRlcGFydHVyZVRpbWVzW2ldLmdldE1pbnV0ZXMoKSkuc2xpY2UoLTIpKSArXHJcblx0XHRcdFx0XCIg0Lgg0L/RgNC40LHRi9Cy0LDQtdGCINCyIFwiICtcclxuXHRcdFx0XHRvcmRlci5zdGFydFBvc2l0aW9uW2ldWzFdICtcclxuXHRcdFx0XHRcIiDQsiBcIiArXHJcblx0XHRcdFx0KChcIjBcIiArIGFycml2YWxUaW1lLmdldEhvdXJzKCkpLnNsaWNlKC0yKSArIFwiOlwiICsgKFwiMFwiICsgYXJyaXZhbFRpbWUuZ2V0TWludXRlcygpKS5zbGljZSgtMikpICtcclxuXHRcdFx0XHRcIi48L3A+XCI7XHJcblx0XHR9XHJcblx0fSBlbHNlIHtcclxuXHRcdGFycml2YWxUaW1lID0gbmV3IERhdGUob3JkZXIuZGVwYXJ0dXJlVGltZXNbMF0uZ2V0VGltZSgpKTtcclxuXHRcdGFycml2YWxUaW1lLnNldE1pbnV0ZXMoYXJyaXZhbFRpbWUuZ2V0TWludXRlcygpICsgdGlja2V0UmVzZXJ2YXRpb25BcHAudHJhdmVsVGltZSk7XHJcblxyXG5cdFx0cDVUZXh0ID1cclxuXHRcdFx0XCI8cD7QotC10L/Qu9C+0YXQvtC0INC+0YLQv9GA0LDQstC70Y/QtdGC0YHRjyDQuNC3IFwiICtcclxuXHRcdFx0b3JkZXIuc3RhcnRQb3NpdGlvblswXVswXSArXHJcblx0XHRcdFwiINCyIFwiICtcclxuXHRcdFx0KChcIjBcIiArIG9yZGVyLmRlcGFydHVyZVRpbWVzWzBdLmdldEhvdXJzKCkpLnNsaWNlKC0yKSArIFwiOlwiICsgKFwiMFwiICsgb3JkZXIuZGVwYXJ0dXJlVGltZXNbMF0uZ2V0TWludXRlcygpKS5zbGljZSgtMikpICtcclxuXHRcdFx0XCIg0Lgg0L/RgNC40LHRi9Cy0LDQtdGCINCyIFwiICtcclxuXHRcdFx0b3JkZXIuc3RhcnRQb3NpdGlvblswXVsxXSArXHJcblx0XHRcdFwiINCyIFwiICtcclxuXHRcdFx0KChcIjBcIiArIGFycml2YWxUaW1lLmdldEhvdXJzKCkpLnNsaWNlKC0yKSArIFwiOlwiICsgKFwiMFwiICsgYXJyaXZhbFRpbWUuZ2V0TWludXRlcygpKS5zbGljZSgtMikpICtcclxuXHRcdFx0XCIuPC9wPlwiO1xyXG5cdH1cclxuXHJcblx0dGlja2V0UmVzZXJ2YXRpb25BcHAuZWxlbWVudHMuaW5mby5pbm5lckhUTUwgPSBwMVRleHQgKyBwMlRleHQgKyBwM1RleHQgKyBwNFRleHQgKyBwNVRleHQ7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBnZXRUaW1lVGV4dCh0b3RhbE1pbnV0ZXMpIHtcclxuXHRpZiAodG90YWxNaW51dGVzID09PSAwKSB7XHJcblx0XHRyZXR1cm4gMDtcclxuXHR9XHJcblxyXG5cdGxldCB0aW1lVGV4dCA9IFwiXCI7XHJcblx0aWYgKHRvdGFsTWludXRlcyA+IDYwKSB7XHJcblx0XHR0aW1lVGV4dCArPSBNYXRoLmZsb29yKHRvdGFsTWludXRlcyAvIDYwKSArIFwiINGHLiBcIjtcclxuXHR9XHJcblx0aWYgKHRvdGFsTWludXRlcyAlIDYwID4gMCkge1xyXG5cdFx0dGltZVRleHQgKz0gKHRvdGFsTWludXRlcyAlIDYwKSArIFwiINC80LjQvS5cIjtcclxuXHR9XHJcblxyXG5cdHJldHVybiB0aW1lVGV4dDtcclxufVxyXG5cclxuZnVuY3Rpb24gZm9ybVJlc2V0KG51bWJlcikge1xyXG5cdGlmIChudW1iZXIgPj0gMykge1xyXG5cdFx0dGlja2V0UmVzZXJ2YXRpb25BcHAuZWxlbWVudHMudGltZUEuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgXCJ0cnVlXCIpO1xyXG5cdFx0dGlja2V0UmVzZXJ2YXRpb25BcHAuZWxlbWVudHMudGltZUEudmFsdWUgPSBudWxsO1xyXG5cdFx0b3JkZXIuc3RhcnRQb3NpdGlvbi5sZW5ndGggPSAwO1xyXG5cdH1cclxuXHJcblx0aWYgKG51bWJlciA+PSAyKSB7XHJcblx0XHR0aWNrZXRSZXNlcnZhdGlvbkFwcC5lbGVtZW50cy50aW1lQi5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcInRydWVcIik7XHJcblx0XHR0aWNrZXRSZXNlcnZhdGlvbkFwcC5lbGVtZW50cy50aW1lQi52YWx1ZSA9IG51bGw7XHJcblx0XHRvcmRlci5kZXBhcnR1cmVUaW1lcy5sZW5ndGggPSAwO1xyXG5cclxuXHRcdGxldCB0aW1lQm9wdGlvbnMgPSB0aWNrZXRSZXNlcnZhdGlvbkFwcC5lbGVtZW50cy50aW1lQi5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm9wdGlvblwiKTtcclxuXHJcblx0XHRmb3IgKGxldCBpID0gMTsgaSA8IHRpbWVCb3B0aW9ucy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHR0aW1lQm9wdGlvbnNbaV0ucmVtb3ZlQXR0cmlidXRlKFwic3R5bGVcIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRpZiAobnVtYmVyID49IDEpIHtcclxuXHRcdHRpY2tldFJlc2VydmF0aW9uQXBwLmVsZW1lbnRzLm51bS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcInRydWVcIik7XHJcblx0XHR0aWNrZXRSZXNlcnZhdGlvbkFwcC5lbGVtZW50cy5udW0udmFsdWUgPSAxO1xyXG5cdFx0b3JkZXIuYW1vdW50ID0gMTtcclxuXHRcdHRpY2tldFJlc2VydmF0aW9uQXBwLmVsZW1lbnRzLnJlc3VsdEJ0bi5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcInRydWVcIik7XHJcblxyXG5cdFx0aWYgKG9yZGVyLmRlcGFydHVyZVRpbWVzLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0b3JkZXIuZGVwYXJ0dXJlVGltZXMucG9wKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRpZiAobnVtYmVyID49IDApIHtcclxuXHRcdHRpY2tldFJlc2VydmF0aW9uQXBwLmVsZW1lbnRzLmluZm8udGV4dENvbnRlbnQgPSBcIlwiO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TmV3RGF0ZSh0aW1lLCB0aW1lWm9uZSkge1xyXG5cdGxldCBkYXRlID0gbmV3IERhdGUob3JkZXIuZGF0ZS5tb250aCArIFwiIFwiICsgb3JkZXIuZGF0ZS5kYXRlICsgXCIsIFwiICsgb3JkZXIuZGF0ZS55ZWFyICsgXCIgXCIgKyB0aW1lICsgXCIgXCIgKyB0aW1lWm9uZSk7XHJcblx0cmV0dXJuIGRhdGU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbnZlcnRUaW1lKCkge1xyXG5cdGxldCB0aW1lQW9wdGlvbnMgPSB0aWNrZXRSZXNlcnZhdGlvbkFwcC5lbGVtZW50cy50aW1lQS5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm9wdGlvblwiKTtcclxuXHRmb3IgKGxldCBpID0gMTsgaSA8IHRpbWVBb3B0aW9ucy5sZW5ndGg7IGkrKykge1xyXG5cdFx0bGV0IG5ld1RpbWUgPVxyXG5cdFx0XHQoXCIwXCIgKyBnZXROZXdEYXRlKHRpbWVBb3B0aW9uc1tpXS52YWx1ZSwgdGlja2V0UmVzZXJ2YXRpb25BcHAudGltZVpvbmUpLmdldEhvdXJzKCkpLnNsaWNlKC0yKSArXHJcblx0XHRcdFwiOlwiICtcclxuXHRcdFx0KFwiMFwiICsgZ2V0TmV3RGF0ZSh0aW1lQW9wdGlvbnNbaV0udmFsdWUsIHRpY2tldFJlc2VydmF0aW9uQXBwLnRpbWVab25lKS5nZXRNaW51dGVzKCkpLnNsaWNlKC0yKTtcclxuXHRcdC8vIHRpbWVBb3B0aW9uc1tpXS52YWx1ZSA9IG5ld1RpbWU7XHJcblx0XHR0aW1lQW9wdGlvbnNbaV0udGV4dENvbnRlbnQgPSBuZXdUaW1lO1xyXG5cdH1cclxuXHJcblx0bGV0IHRpbWVCb3B0aW9ucyA9IHRpY2tldFJlc2VydmF0aW9uQXBwLmVsZW1lbnRzLnRpbWVCLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwib3B0aW9uXCIpO1xyXG5cdGZvciAobGV0IGkgPSAxOyBpIDwgdGltZUJvcHRpb25zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRsZXQgbmV3VGltZSA9XHJcblx0XHRcdChcIjBcIiArIGdldE5ld0RhdGUodGltZUJvcHRpb25zW2ldLnZhbHVlLCB0aWNrZXRSZXNlcnZhdGlvbkFwcC50aW1lWm9uZSkuZ2V0SG91cnMoKSkuc2xpY2UoLTIpICtcclxuXHRcdFx0XCI6XCIgK1xyXG5cdFx0XHQoXCIwXCIgKyBnZXROZXdEYXRlKHRpbWVCb3B0aW9uc1tpXS52YWx1ZSwgdGlja2V0UmVzZXJ2YXRpb25BcHAudGltZVpvbmUpLmdldE1pbnV0ZXMoKSkuc2xpY2UoLTIpO1xyXG5cdFx0Ly8gdGltZUJvcHRpb25zW2ldLnZhbHVlID0gbmV3VGltZTtcclxuXHRcdHRpbWVCb3B0aW9uc1tpXS50ZXh0Q29udGVudCA9IG5ld1RpbWU7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRJbnRlcnZhbChzdGFydCwgZW5kKSB7XHJcblx0bGV0IGludGVydmFsID0gZW5kIC0gc3RhcnQ7XHJcblx0bGV0IHNlY29uZHMgPSBNYXRoLnJvdW5kKGludGVydmFsIC8gMTAwMCk7XHJcblx0bGV0IG1pbnV0ZXMgPSBNYXRoLnJvdW5kKHNlY29uZHMgLyA2MCk7XHJcblx0bGV0IGhvdXJzID0gTWF0aC5yb3VuZChtaW51dGVzIC8gNjApO1xyXG5cdGxldCBkYXlzID0gTWF0aC5yb3VuZChob3VycyAvIDI0KTtcclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGRheXM6IGRheXMsXHJcblx0XHRob3VyczogaG91cnMsXHJcblx0XHRtaW51dGVzOiBtaW51dGVzLFxyXG5cdFx0c2Vjb25kczogc2Vjb25kcyxcclxuXHR9O1xyXG59XHJcblxyXG5jb252ZXJ0VGltZSgpO1xyXG4iXSwiZmlsZSI6InNjcmlwdC5qcyJ9
