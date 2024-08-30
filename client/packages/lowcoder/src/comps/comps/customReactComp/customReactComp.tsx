import {CompAction, executeQueryAction, routeByNameAction} from "lowcoder-core";
import {jsonValueControl, StringControl} from "comps/controls/codeControl";
import {jsonObjectStateControl} from "comps/controls/codeStateControl";
import {UICompBuilder, withDefault} from "comps/generators";
import {NameConfig, NameConfigHidden, withExposingConfigs} from "comps/generators/withExposing";
import {Section, sectionNames} from "lowcoder-design";
import React, {createElement, FunctionComponent, ReactElement, useContext, useMemo, useState} from "react";
import styled from "styled-components";
import {getPromiseAfterDispatch} from "util/promiseUtils";
import {hiddenPropertyView} from "comps/utils/propertyUtils";
import {trans} from "i18n";
import {EditorContext} from "comps/editorState";
import {AutoHeightControl} from "comps/controls/autoHeightControl";
import * as Antd from 'antd'
import * as AntdMobile from 'antd-mobile'
import * as AntIcons from '@ant-design/icons'
import {useAsyncRunner} from './useAsyncRunner'
import ReactDOM from "react-dom";
import {createRoot} from "react-dom/client";
import {JSONObject, JSONValue} from "lowcoder-sdk";
import _ from "lodash";
import * as Axios from "axios";

const defaultInput = {
  name: "{{currentUser.name}}", query: "query1"
};

const defaultModel = {
  text: trans("customComp.text")
};

const defaultCode = `import { Button } from "antd";
import { updateModel, runQuery } from "lowcoder";
import styled from "styled-components";

const Wrapper = styled.div\`
height: 100%;
width: 100%;
\`;

export default function App({ model, input }) {
  return (
    <>
      <Wrapper>
        <Button onClick={() => updateModel({ text: "New Text" })}>
          Update model text
        </Button>
        <Button onClick={() => runQuery(input.query)}>Run Query</Button>
        <div>Model text: {model.text}</div>
        <div>Input name: {input.name}</div>
      </Wrapper>
    </>
  );
}
`;

type IProps = {
  input: JSONValue;
  code: string;
  model: JSONObject;
  onModelChange: (v: any) => void;
  dispatch: (action: CompAction<any>) => void;
};

const Wrapper = styled.div`
    width: 100%;
    height: 100%;

    .Preview {
        position: relative;
        height: 100%;
        overflow: auto;
    }

    .PreviewError {
        box-sizing: border-box;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        margin: 0;
        padding: 16px;
        width: 100%;
        background: rgba(255, 204, 204, 0.7);
        color: #f00;
        white-space: pre-wrap;
    }

    .PreviewLoading {
        all: unset;
        box-sizing: border-box;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;

        &::after {
            content: '';
            display: block;
            height: 4px;
            background-color: steelblue;

            animation: progress 1s infinite ease-in-out;
        }
    }

    @keyframes progress {
        0% {
            width: 0;
        }
        100% {
            width: 100%;
        }
    }
`;


function InnerCustomComponent(props: IProps) {
  const {input, model: initialModel, code, onModelChange, dispatch} = props;
  const [model, setModel] = useState(initialModel);

  const scope = useMemo(() => {
    const updateModel = (data: any) => {
      setModel({
        ...model, ...data,
      });
      onModelChange({
        ...model, ...data,
      });
    };
    const runQuery = async (queryName: string, args: any) => {
      return getPromiseAfterDispatch(dispatch, routeByNameAction(queryName, executeQueryAction({args}))).catch((error) => Promise.resolve({}));
    };

    return {
      import: {
        react: React,
        antd: Antd,
        'antd-mobile': AntdMobile,
        'styled-components': styled,
        '@ant-design/icons': AntIcons,
        axios: Axios,
        'react-dom': {
          ...ReactDOM, render: (element: ReactElement) => createRoot(document.getElementById('root')!)
            .render(element)
        },
        lowcoder: {runQuery, updateModel},
      },
    };
  }, []);

  const files = useMemo(() => ({"App.tsx": code}), [code]);

  const {element, styleSheets, error, isLoading} = useAsyncRunner({
    files, scope
  })

  if (typeof document !== 'undefined' && !_.isEmpty(styleSheets)) {
    document.adoptedStyleSheets = styleSheets
  }

  return (<Wrapper>
    <div className="Preview">
      {isLoading && <div className="PreviewLoading"></div>}
      <div className="PreviewElementContainer">
        <div className="PreviewElement">
          <>{(typeof element === 'function') ? createElement(element as FunctionComponent, {
            input, model
          } as any) : element}</>
        </div>
      </div>
      {error && <pre className="PreviewError">{error}</pre>}
    </div>
  </Wrapper>)
}

const childrenMap = {
  input: jsonValueControl(defaultInput),
  model: jsonObjectStateControl(defaultModel),
  code: withDefault(StringControl, defaultCode),
  autoHeight: withDefault(AutoHeightControl, "fixed")
};

const CustomCompBase = new UICompBuilder(childrenMap, (props, dispatch) => {
  const {code, model, input} = props;
  return (<InnerCustomComponent
    code={code}
    input={input}
    model={model.value}
    onModelChange={(v) => model.onChange(v)}
    dispatch={dispatch}
  />);
})
  .setPropertyViewFn((children) => {
    return (<>
      {(useContext(EditorContext).editorModeStatus === "logic" || useContext(EditorContext).editorModeStatus === "both") && (<>
        <Section name={sectionNames.interaction}>
          {children.input.propertyView({label: "Input data"})}
          {children.model.propertyView({label: "Initial model data"})}
          {children.code.propertyView({label: trans("customComp.code"), language: "html"})}
          {hiddenPropertyView(children)}
          {children.autoHeight.getPropertyView()}
        </Section>
      </>)}
    </>);
  })
  .build();

class CustomCompAutoHeight extends CustomCompBase {
  override autoHeight(): boolean {
    return this.children.autoHeight.getView();
  }
}

export const CustomReactComp = withExposingConfigs(CustomCompAutoHeight, [new NameConfig("model", trans("data")), new NameConfig("code", trans("code")), NameConfigHidden,]);
