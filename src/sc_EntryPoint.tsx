import styled from 'styled-components';
const sc_EntryPoint = {
    FlexDiv: styled.div`
        display: flex;
    `,
    ImageListFooter: styled.div`
        display: flex;
        input {
            &:last-child {
                flex-grow: 1;
            }
        }
    `,
    ImgFooterButton: styled.button`
        font-size: 18px;
        margin-left: 6px;
    `,
    HorizontalLine: styled.hr`
        width: 100%;
    `,
};

export default sc_EntryPoint;
