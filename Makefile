SRC = $(wildcard *.coffee)
LIB = $(SRC:%.coffee=%.js)

all: build

build: $(LIB)

watch:
	watch -n1 $(MAKE)

clean:
	rm -f *.js

test-server:
	@(cd tests; python -m SimpleHTTPServer)

test:
	$(MAKE) -j2 test-server watch

%.js: %.coffee
	coffee -bcp $< > $@
