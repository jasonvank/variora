import { DocumentTab } from '../variora/home/static/components/document_tab.jsx'
import React from 'react';
import { StaticRouter } from 'react-router'
import renderer from 'react-test-renderer';

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3)
})

const location = {
  'pathname': '/'
}

test('test react', () => {
  const component = renderer.create(
    <StaticRouter location={location} context={{}}>
      <DocumentTab location={location} />
    </StaticRouter>
  ).toJSON()
  expect(component).toMatchSnapshot()
})
