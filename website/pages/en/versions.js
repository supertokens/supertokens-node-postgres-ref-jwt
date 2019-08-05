/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const CompLibrary = require('../../core/CompLibrary');
const Container = CompLibrary.Container;
const CWD = process.cwd();
const versions = require(`${CWD}/versions.json`);
function Versions(props) {
  const { config: siteConfig } = props;
  const latestVersion = versions[0];
  return (
    <div style={{
      backgroundColor: "rgb(20,20,20)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
    }}>
      <div
        style={{
          marginTop: 70,
          color: "#dddddd",
          fontSize: "18pt",
          alignSelf: "flex-start",
          marginLeft: "5%",
          backgroundColor: "#202020",
          fontWeight: "bold",
          padding: "0px",
        }}>
        Versions
      </div>
      <div
        style={{
          marginTop: 30,
          display: "flex",
          flexDirection: "column",
          marginLeft: "5%",
        }}>
        {
          versions.map((version, index) => {
            let url = `${siteConfig.baseUrl}${siteConfig.docsUrl}/introduction/what-and-why`;
            if (version !== latestVersion) {
              url = `${siteConfig.baseUrl}${siteConfig.docsUrl}/${version}/introduction/what-and-why`;
            }
            return (
              <div
                key={version}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  fontSize: 16,
                  letterSpacing: "0.16pt",
                  marginTop: index === 0 ? 0 : 20,
                  position: "relative",
                  paddingTop: index === 0 ? 0 : 20,
                  alignSelf: "flex-start",
                }}>
                <div style={{
                  height: index === 0 ? 0 : 1,
                  width: "100%",
                  backgroundColor: "#444444",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                }} />
                <div
                  style={{
                    color: "#dddddd",
                  }}>
                  {version}
                </div>
                <a
                  className="version-documentation"
                  href={url}>
                  Documentation
                  </a>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}
module.exports = Versions;