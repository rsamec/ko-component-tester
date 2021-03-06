'use strict'

const ko = require('knockout')
const { renderComponent } = require('../src')
const { expect } = require('chai')

describe('waitForBinding' , () => {
  let $el

  before(() => {
    ko.bindingHandlers.asyncText = {
      init(el, valueAccessor) {
        setTimeout(() => {
          ko.applyBindingsToNode(el, {
            text: valueAccessor()
          })
        }, 200)
        return { controlsDescendantBindings: true }
      }
    }

    ko.bindingHandlers.asyncVisible = {
      init(el, valueAccessor) {
        setTimeout(() => {
          ko.applyBindingsToNode(el, {
            visible: valueAccessor()
          })
        }, 200)
        return { controlsDescendantBindings: true }
      }
    }
  })

  after(() => {
    ko.options.deferUpdates = false
    ko.bindingHandlers.asyncText = (void 0)
  })

  afterEach(() => {
    $el.dispose()
  })

  it('should throw error if binding is not defined', (done) => {
    $el = renderComponent({
      template: '<span class="test-me" data-bind="notdefined: \'\'"></span>',
      viewModel() { }
    })

    const $$el = $el.find('.test-me')
    try {
      $$el.waitForBinding('notdefined')
    }
    catch (e) {
      expect(e.message).to.contain('binding does not exist')
    }
    done()
  })

  it('works with bindings that have init funcs', (done) => {
    $el = renderComponent({
      template: `
        <span class="ignore-me" data-bind="asyncText: greeting"></span>
        <span class="test-me" data-bind="asyncText: greeting"></span>
      `,
      viewModel() { this.greeting = 'Hello Component' }
    })

    const $$el = $el.find('.test-me')
    $$el.waitForBinding('text').then(() => {
      expect($$el.html()).to.contain('Hello Component')
      done()
    })
  })

  it('works with bindings that DON\'T have init funcs', (done) => {
    $el = renderComponent({
      template: `
        <span class="test-me" data-bind="asyncVisible: visible"></span>
      `,
      viewModel() { this.visible = false }
    })

    const $$el = $el.find('.test-me')
    $$el.waitForBinding('visible').then(() => {
      expect($$el).to.not.be.visible
      done()
    })
  })
})
