import { DocumentTab } from '../variora/home/static/components/document_tab.jsx'
import React from 'react';
import renderer from 'react-test-renderer';

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

test('test react', () => {
  const component = renderer.create(
    <DocumentTab />,
  ).toJSON();
  expect(component).toMatchSnapshot()
});

