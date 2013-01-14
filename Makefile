SRC = $(wildcard *.coffee)
LIB = $(SRC:%.coffee=%.js)

all: build

build: $(LIB)

test:
	open -a 'Google Chrome.app' tests/index.html

clean:
	rm -f *.js

%.js: %.coffee
	coffee -bcp $< > $@
