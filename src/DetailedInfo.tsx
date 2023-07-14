import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { CustomTable as ct } from './ImageTable';

type DetailedInfoType = {
    items: Array<string>;
};
// 이전에 사용했던 이미지 테이블 css를 가져옴.
const CustomTable = styled(ct)`
    input {
        margin: 5px 0;
        font-size: 16px;
    }
`;

const DetailedInfo = (
    { items }: DetailedInfoType,
    // useRef를 이용해 input의 value를 부모 컴포넌트에서 직접 추출.
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
