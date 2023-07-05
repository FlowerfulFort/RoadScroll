// EntryPoint.tsx에서 사용하는 컴포넌트.
import styled from 'styled-components';
const sc_EntryPoint = {
    // 이미지 업로드 팝업 하단
    ImageListFooter: styled.div`
        display: flex;
        input {
            &:last-child {
                flex-grow: 1;
            }
        }
    `,
    // 이미지 업로드 팝업 하단 버튼
    ImgFooterButton: styled.button`
        font-size: 18px;
        margin-left: 6px;
    `,
    // flexdiv 내부에서 사용하는 가로선
    HorizontalLine: styled.hr`
        width: 100%;
    `,
};

export default sc_EntryPoint;
