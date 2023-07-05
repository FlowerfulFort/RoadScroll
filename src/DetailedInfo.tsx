import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { CustomTable as ct } from './ImageTable';

type DetailedInfoType = {
    items: Array<string>;
};
const CustomTable = styled(ct)`
    input {
        margin: 5px 0;
        font-size: 16px;
    }
`;

const DetailedInfo = (
    { items }: DetailedInfoType,
    ref: React.ForwardedRef<HTMLDivElement>
): JSX.Element => {
    return (
        <div style={{ marginBottom: '5px' }} ref={ref}>
            <CustomTable id="detailedInfo">
                <tbody>
                    {items.map((e, i) => {
                        return (
                            <tr key={i}>
                                <th>{e}</th>
                                <th>
                                    <input />
                                </th>
                            </tr>
                        );
                    })}
                </tbody>
            </CustomTable>
        </div>
    );
};
export default forwardRef<HTMLDivElement, DetailedInfoType>(DetailedInfo);
