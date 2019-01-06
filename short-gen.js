function generateRandomKey() {
	let key = ''
	for (let i = 0; i < 5; i++) {
		let randomNum = Math.random();
		let upCaseRN = Math.round(Math.random() * (90 - 65)) + 65;
		let lowCaseRN = Math.round(Math.random() * (123 - 97)) + 97;
		let numRN = Math.round(Math.random()* (57 - 48)) + 48;
		key += (randomNum > 0.375 ? (randomNum > 0.75 ? String.fromCharCode(numRN) : String.fromCharCode(upCaseRN)) : String.fromCharCode(lowCaseRN));
	}
	console.log(key);
	return key;
}

generateRandomKey();