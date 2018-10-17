class QUIrenderer {
	constructor(url) {
		fetch(url).then(e=>e.text()).then(e=>JSON.parse(e))
		//will change this
	}
}
