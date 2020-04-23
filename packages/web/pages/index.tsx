import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';

const Container = styled.div`
  min-height: 100vh;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Footer = styled.footer`
  width: 100%;
  height: 100px;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Main = styled.main`
  padding: 5rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default function Home() {
  return (
    <Container>
      <Head>
        <title>Elevator Code Challenge - Typescript Solution</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <p>building</p>
      </Main>

      <Footer>
        Elevator Code Challenge - A Typescript Solution | &nbsp;
        <a href="https://github.com/chrischenyc/elevator-code-challenge" target="_blank" rel="noopener noreferrer">
          source code
        </a>
      </Footer>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </Container>
  );
}
