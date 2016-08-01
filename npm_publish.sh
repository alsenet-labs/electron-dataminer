#!/bin/bash
set -e

npm publish

WD=$PWD
TMPDIR=$(mktemp -u)

mkdir $TMPDIR

cd $WD
cp -a test $TMPDIR
cd $TMPDIR/test
npm publish

cd $WD
cp -a test/api $TMPDIR
cd $TMPDIR/api
npm publish

cd $WD
cp -a test/page $TMPDIR
cd $TMPDIR/page
npm publish

cd $WD
rm $TMPDIR -rf




