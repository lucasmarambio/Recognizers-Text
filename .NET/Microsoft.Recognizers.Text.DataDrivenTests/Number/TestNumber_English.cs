﻿using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;

namespace Microsoft.Recognizers.Text.DataDrivenTests.Number
{
    [TestClass]
    public class TestNumber_English : TestBase
    {
        public static TestResources TestResources { get; protected set; }
        public static IDictionary<string, IModel> Models { get; protected set; }

        [ClassInitialize]
        public static void ClassInitialize(TestContext context)
        {
            TestResources = new TestResources();
            TestResources.InitFromTestContext(context);
            Models = new Dictionary<string, IModel>();
        }

        [TestInitialize]
        public void TestInitialize()
        {
            base.TestSpecInitialize(TestResources);
            base.ModelInitialize(Models);
        }

        [DataSource("Microsoft.VisualStudio.TestTools.DataSource.CSV", "NumberModel-English.csv", "NumberModel-English#csv", DataAccessMethod.Sequential)]
        [TestMethod]
        public void NumberModel()
        {
            base.TestNumber();
        }

        [DataSource("Microsoft.VisualStudio.TestTools.DataSource.CSV", "OrdinalModel-English.csv", "OrdinalModel-English#csv", DataAccessMethod.Sequential)]
        [TestMethod]
        public void OrdinalModel()
        {
            base.TestNumber();
        }

        [DataSource("Microsoft.VisualStudio.TestTools.DataSource.CSV", "PercentModel-English.csv", "PercentModel-English#csv", DataAccessMethod.Sequential)]
        [TestMethod]
        public void PercentModel()
        {
            base.TestNumber();
        }
    }
}
