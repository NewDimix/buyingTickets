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
