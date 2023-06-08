import * as React from 'react';
import styled from 'styled-components';
import { ApolloError } from 'apollo-client';

const ErrorList = styled.section`
  background-color: #000;
  color: #f66;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  padding: 8px;
`;

const ErrorItem = styled.section`
  > header {
    align-items: center;
    background-color: #400;
    color: #f88;
    display: flex;
    flex-direction: row;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    padding: .5rem;
    > .title {
      color: #faa;
      font-weight: bold;
      margin-right: .6rem;
    }
  }
`;

const ErrorTable = styled.section`
  display: grid;
  grid-auto-flow: row;
  grid-column-gap: .5rem;
  grid-row-gap: .5rem;
  grid-template-columns: [label] 6rem [content] 1fr;
`;

const ErrorRowLabel = styled.div`
  color: #faa;
  font-weight: bold;
  grid-column: label;
  white-space: nowrap;
  justify-self: end;
`;

const ErrorRowData = styled.div`
  grid-column: content;
  white-space: pre;
`;

const ErrorRowDataPre = styled(ErrorRowData)`
  font-family: monospace;
  font-size: 1.1rem;
`;

export function ErrorDisplay({ error }: { error: ApolloError }) {
    // TODO: networkError
    return (
        <ErrorList>
            {(error.graphQLErrors || []).map((gqlError, index) => (
                <ErrorItem key={index}>
                    <header>
                        <div className="title">GraphQL Error:</div>
                        <div className="message">{gqlError.message}</div>
                    </header>
                    <ErrorTable>
                        {gqlError.extensions && gqlError.extensions.code && (
                            <React.Fragment>
                                <ErrorRowLabel>Error code:</ErrorRowLabel>
                                <ErrorRowData>{gqlError.extensions.code}</ErrorRowData>
                            </React.Fragment>
                        )}
                        {gqlError.extensions &&
                            gqlError.extensions.exception &&
                            gqlError.extensions.exception.stacktrace && (
                                <React.Fragment>
                                    <ErrorRowDataPre>
                                        {gqlError.extensions.exception.stacktrace.map(
                                            (line: string, index: number) => <div key={index}>{line}</div>)}
                                    </ErrorRowDataPre>
                                </React.Fragment>
                            )}
                    </ErrorTable>
                </ErrorItem>
            ))}
        </ErrorList>
    );
}