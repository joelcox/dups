test:
	npm test

lint:
	jshint lib/ spec/

coverage:
	npm test --coverage

clean:
	rm -r coverage