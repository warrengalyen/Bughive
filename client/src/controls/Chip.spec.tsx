import * as React from 'react';
import { mount } from 'enzyme';
import { Chip } from './Chip';
import { themeDefault } from '../style';

describe('controls.Chip', () => {
    test('render', () => {
        const wrapper = mount(<Chip theme={themeDefault}>Caption</Chip>);
        expect(wrapper).toHaveDisplayName('Styled(ChipImpl)');
        expect(wrapper).toHaveText('Caption');
        expect(wrapper.find('span')).toExist();
        expect(wrapper.find('span').first()).toHaveClassName('chip');
    });
});
