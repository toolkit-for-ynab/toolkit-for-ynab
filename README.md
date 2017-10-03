# Toolkit for YNAB Website

This branch holds the website at [toolkitforynab.com](http://toolkitforynab.com).

## To Build / Work Locally

This site is built with Jekyll and generates/deploys using GitHub Pages.

1. Check whether you have Ruby 2.1.0 or higher installed.

    ```
    $ ruby --version
    ruby 2.X.X
    ```

    * If not, [install Ruby 2.1.0 or higher](https://www.ruby-lang.org/en/downloads/).

2. Install Bundler:

	```
	$ gem install bundler
	```

3. Install all the dependencies needed to generate the site:
	
	```
	$ bundle install
	```

4. Serve the site locally

	```
	$ bundle exec jekyll serve
	```
	
The site should now be available on [localhost:4000](http://localhost:4000).

## Contributing

Contributions are welcome on everything we do, even on our website. Please open a PR and we'll get to it as soon as we can!
