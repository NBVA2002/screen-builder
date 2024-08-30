import {jsonValueControl, StringControl} from "comps/controls/codeControl";
import {UICompBuilder, withDefault} from "comps/generators";
import {NameConfigHidden, withExposingConfigs} from "comps/generators/withExposing";
import {Section, sectionNames} from "lowcoder-design";
import React, {useContext} from "react";
import {hiddenPropertyView} from "comps/utils/propertyUtils";
import {EditorContext} from "comps/editorState";
import {AutoHeightControl} from "comps/controls/autoHeightControl";
import {ChangeEventHandlerControl, LowcoderAppView} from "lowcoder-sdk";

const defaultInput = {};

const childrenMap = {
  moduleInputs: jsonValueControl(defaultInput),
  appId: StringControl,
  baseUrl: withDefault(StringControl, "https://screenbuilder.smartcity-cloud.org/"),
  onEvent: ChangeEventHandlerControl,
  autoHeight: withDefault(AutoHeightControl, "fixed")
};

const CustomCompBase = new UICompBuilder(childrenMap, (props, dispatch) => {
  const {moduleInputs, appId, baseUrl} = props;
  if (!appId) return <></>;
  return (<LowcoderAppView appId={appId} baseUrl={baseUrl} moduleInputs={moduleInputs} onModuleEventTriggered={(e) => {
    props.onEvent("change")
  }}/>);
})
  .setPropertyViewFn((children) => {
    return (<>
      {(useContext(EditorContext).editorModeStatus === "logic" || useContext(EditorContext).editorModeStatus === "both") && (<>
        <Section name={sectionNames.interaction}>
          {children.appId.propertyView({label: "App Id"})}
          {children.baseUrl.propertyView({label: "Base URL"})}
          {children.moduleInputs.propertyView({label: "Module inputs"})}
          {hiddenPropertyView(children)}
          {children.autoHeight.getPropertyView()}
          {children.onEvent.getPropertyView()}
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

export const DynamicModuleComp = withExposingConfigs(CustomCompAutoHeight, [NameConfigHidden,]);
