/* eslint-env mocha */
/* eslint-disable react/prop-types, react/prefer-stateless-function */
import React from 'react';
import { expect } from 'chai';
import {
  renderIntoDocument,
  findRenderedDOMComponentWithTag,
  scryRenderedComponentsWithType,
  Simulate,
} from 'react-addons-test-utils';
import Promise from 'bluebird';

import TestRoot from '../lib/TestRoot';
import {
  CounterComponent,
  MethodCounterComponent,
  BasicContainer,
  DonelessContainer,
  WithAsContainer,
  WithMethodsContainer,
  BadAsContainer,
  BadGrabContainer,
  DelayedFetchContainer,
  AbortFetchContainer,
} from '../lib/containers';


describe('Container', () => {
  it('should render straight away with zero fetches', () => {
    const dom = renderIntoDocument(
      <TestRoot>
        <BasicContainer />
      </TestRoot>
    );
    const div = findRenderedDOMComponentWithTag(dom, 'div');
    expect(div.textContent).to.equal('Done');
  });

  it('shouldn\'t need to have a done method', () => {
    const dom = renderIntoDocument(
      <TestRoot>
        <DonelessContainer />
      </TestRoot>
    );
    const div = findRenderedDOMComponentWithTag(dom, 'div');
    expect(div.textContent).to.equal('Done');
  });

  it('should get state props passed by as', () => {
    const dom = renderIntoDocument(
      <TestRoot>
        <WithAsContainer />
      </TestRoot>
    );
    const [div] = scryRenderedComponentsWithType(dom, CounterComponent);
    expect(div.props).to.have.property('counter');
  });

  it('should get state values via as initially', () => {
    const dom = renderIntoDocument(
      <TestRoot>
        <WithAsContainer />
      </TestRoot>
    );
    const [div] = scryRenderedComponentsWithType(dom, CounterComponent);
    expect(div.props.counter).to.equal(0);
  });

  it('should update the internal prop when state has changed', () => {
    const dom = renderIntoDocument(
      <TestRoot>
        <WithMethodsContainer />
      </TestRoot>
    );
    const div = findRenderedDOMComponentWithTag(dom, 'div');
    Simulate.click(div);
    const [component] = scryRenderedComponentsWithType(dom, MethodCounterComponent);
    expect(component.props.counter).to.equal(1);
  });

  it('should require as to be a function', () => {
    const doRender = () => renderIntoDocument(
      <TestRoot>
        <BadAsContainer />
      </TestRoot>
    );
    expect(doRender).to.throw(Error);
  });

  it('should wait until all fetches have returned before rendering done', async function () {
    this.timeout(3000);
    const dom = renderIntoDocument(
      <TestRoot>
        <DelayedFetchContainer />
      </TestRoot>
    );

    // Pre fetch
    let div = findRenderedDOMComponentWithTag(dom, 'div');
    expect(div.textContent).not.to.equal('Done');
    await new Promise(resolve => setTimeout(resolve, 200));

    // First fetch will have returned
    div = findRenderedDOMComponentWithTag(dom, 'div');
    expect(div.textContent).not.to.equal('Done');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Last fetch will have returned
    div = findRenderedDOMComponentWithTag(dom, 'div');
    expect(div.textContent).to.equal('Done');
  });

  it('should run pending while waiting for all fetches to return', async function () {
    this.timeout(3000);
    const dom = renderIntoDocument(
      <TestRoot>
        <DelayedFetchContainer />
      </TestRoot>
    );

    // Pre fetch
    let div = findRenderedDOMComponentWithTag(dom, 'div');
    expect(div.textContent).to.equal('Pending');
    await new Promise(resolve => setTimeout(resolve, 200));

    // First fetch will have returned
    div = findRenderedDOMComponentWithTag(dom, 'div');
    expect(div.textContent).to.equal('Pending');
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  it('should call failed if something threw within the fetch', async () => {
    const dom = renderIntoDocument(
      <TestRoot>
        <AbortFetchContainer />
      </TestRoot>
    );

    await new Promise(resolve => setTimeout(resolve, 0));
    const div = findRenderedDOMComponentWithTag(dom, 'div');
    expect(div.textContent).to.equal('Failed');
  });

  it('should enforce grab factoring asVal by being a dick', () => {
    const doRender = () => renderIntoDocument(
      <TestRoot>
        <BadGrabContainer />
      </TestRoot>
    );

    expect(doRender).to.throw(Error);
  });

  it('should provide the contained component with methods', () => {
    const dom = renderIntoDocument(
      <TestRoot>
        <WithMethodsContainer />
      </TestRoot>
    );
    const [component] = scryRenderedComponentsWithType(dom, MethodCounterComponent);
    expect(component.props.increment).to.be.a('function');
  });
});
