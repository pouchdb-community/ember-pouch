# Ember Data HAL Adapter

[![Code Climate](https://codeclimate.com/github/locks/ember-data-hal-adapter.png)](https://codeclimate.com/github/locks/ember-data-hal-adapter)

## What

A couple months back I started developing an Ember application that was driven by an hypermedia API using the [`application/json+hal`][1] media type.
Given the lack of adapter I set out to build my own, and herein lies the result.

It isn't exactly general at the moment, since I'm only using it in this one project, so please try it out and leave me some feedback on how to improve it.

## How

Copy the files to your project, stick the needed requires and override what you must.

[1]: http://tools.ietf.org/html/draft-kelly-json-hal-06
